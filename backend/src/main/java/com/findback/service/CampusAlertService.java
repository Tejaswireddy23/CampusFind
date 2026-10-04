package com.findback.service;

import com.findback.dto.CampusAlertDto;
import com.findback.exception.BadRequestException;
import com.findback.exception.ResourceNotFoundException;
import com.findback.model.CampusAlert;
import com.findback.model.NotificationType;
import com.findback.model.Role;
import com.findback.model.User;
import com.findback.repository.CampusAlertRepository;
import com.findback.repository.ItemRepository;
import com.findback.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CampusAlertService {

    @Autowired
    private CampusAlertRepository alertRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditService auditService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public CampusAlertDto createAlert(CampusAlertDto dto, User admin) {
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new BadRequestException("Alert title is required");
        }
        if (dto.getMessage() == null || dto.getMessage().isBlank()) {
            throw new BadRequestException("Alert message is required");
        }

        CampusAlert alert = new CampusAlert(
                dto.getTitle().trim(),
                dto.getMessage().trim(),
                dto.getCategory() != null ? dto.getCategory().trim() : "General",
                dto.getTargetAudience() != null ? dto.getTargetAudience().trim() : "ALL STUDENTS",
                dto.getDepartment() != null ? dto.getDepartment().trim() : null,
                dto.getYear() != null ? dto.getYear().trim() : null,
                dto.getSection() != null ? dto.getSection().trim() : null,
                dto.getPriority() != null ? dto.getPriority().trim() : "NORMAL",
                admin != null ? admin.getName() : "Campus Administration"
        );

        alert = alertRepository.save(alert);

        // Find targeted students
        Set<User> recipients = findTargetedStudents(alert);

        // Send notifications
        for (User student : recipients) {
            notificationService.createNotification(
                    student.getId(),
                    "🚨 " + alert.getTitle(),
                    alert.getMessage(),
                    NotificationType.CAMPUS_ALERT,
                    "/campus-alerts"
            );
        }

        // Broadcast to general campus channel
        CampusAlertDto resultDto = toDto(alert);
        resultDto.setTargetedUsersCount(recipients.size());
        messagingTemplate.convertAndSend("/topic/campus-alerts", resultDto);

        // Log audit
        auditService.log(
                admin != null ? admin.getId() : 1L,
                "CAMPUS_ALERT_CREATED",
                "ALERT",
                alert.getId(),
                "Created campus alert: " + alert.getTitle() + " (Priority: " + alert.getPriority() + ", Target: " + alert.getTargetAudience() + ")",
                null
        );

        return resultDto;
    }

    public Page<CampusAlertDto> getAlertsForUser(User user, Pageable pageable) {
        if (user.getRole() == Role.ADMIN) {
            return alertRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toDto);
        }

        String dept = user.getDepartment() != null ? user.getDepartment() : "";
        String year = user.getYear() != null ? user.getYear() : "";
        String section = user.getSection() != null ? user.getSection() : "";

        return alertRepository.findAlertsForStudent(dept, year, section, pageable).map(this::toDto);
    }

    public Page<CampusAlertDto> getAllAlerts(Pageable pageable) {
        return alertRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toDto);
    }

    @Transactional
    public void deleteAlert(Long id, User admin) {
        CampusAlert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campus alert not found with id " + id));
        alertRepository.delete(alert);

        auditService.log(
                admin.getId(),
                "CAMPUS_ALERT_DELETED",
                "ALERT",
                id,
                "Deleted campus alert: " + alert.getTitle(),
                null
        );
    }

    private Set<User> findTargetedStudents(CampusAlert alert) {
        List<User> allStudents = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.STUDENT && ("APPROVED".equalsIgnoreCase(u.getStatus()) || "ACTIVE".equalsIgnoreCase(u.getStatus())))
                .collect(Collectors.toList());

        String target = alert.getTargetAudience();
        if ("ALL STUDENTS".equalsIgnoreCase(target)) {
            return new HashSet<>(allStudents);
        }

        Set<User> matched = new HashSet<>();
        if ("SPECIFIC DEPARTMENT".equalsIgnoreCase(target) && alert.getDepartment() != null) {
            String dept = alert.getDepartment().toLowerCase().trim();
            for (User u : allStudents) {
                if (u.getDepartment() != null && u.getDepartment().toLowerCase().contains(dept)) {
                    matched.add(u);
                }
            }
        } else if ("SPECIFIC YEAR".equalsIgnoreCase(target) && alert.getYear() != null) {
            String y = alert.getYear().toLowerCase().trim();
            for (User u : allStudents) {
                if (u.getYear() != null && u.getYear().toLowerCase().contains(y)) {
                    matched.add(u);
                }
            }
        } else if ("SPECIFIC SECTION".equalsIgnoreCase(target) && alert.getSection() != null) {
            String s = alert.getSection().toLowerCase().trim();
            for (User u : allStudents) {
                if (u.getSection() != null && u.getSection().toLowerCase().contains(s)) {
                    matched.add(u);
                }
            }
        } else if ("STUDENTS WITH RELEVANT REPORTS".equalsIgnoreCase(target)) {
            // Find students with active reports in category or title
            String cat = alert.getCategory();
            for (User u : allStudents) {
                boolean hasReport = itemRepository.findByUserId(u.getId(), Pageable.unpaged()).stream()
                        .anyMatch(i -> (cat != null && cat.equalsIgnoreCase(i.getCategory())) ||
                                (alert.getTitle() != null && i.getTitle().toLowerCase().contains(alert.getTitle().toLowerCase().split(" ")[0])));
                if (hasReport) {
                    matched.add(u);
                }
            }
        }

        // Fallback: If targeted subset is empty, broadcast to all
        return matched.isEmpty() ? new HashSet<>(allStudents) : matched;
    }

    public CampusAlertDto toDto(CampusAlert alert) {
        CampusAlertDto dto = new CampusAlertDto();
        dto.setId(alert.getId());
        dto.setTitle(alert.getTitle());
        dto.setMessage(alert.getMessage());
        dto.setCategory(alert.getCategory());
        dto.setTargetAudience(alert.getTargetAudience());
        dto.setDepartment(alert.getDepartment());
        dto.setYear(alert.getYear());
        dto.setSection(alert.getSection());
        dto.setPriority(alert.getPriority());
        dto.setCreatedBy(alert.getCreatedBy());
        dto.setCreatedAt(alert.getCreatedAt());
        return dto;
    }
}
