package com.findback.service;

import com.findback.dto.AuditLogDto;
import com.findback.model.AuditLog;
import com.findback.model.User;
import com.findback.repository.AuditLogRepository;
import com.findback.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserRepository userRepository;

    public void log(Long userId, String action, String entityType, Long entityId, String details, String ipAddress) {
        try {
            AuditLog log = new AuditLog(userId, action, entityType, entityId, details, ipAddress);
            auditLogRepository.save(log);
        } catch (Exception e) {
            // Do not break user transaction if audit log fails
        }
    }

    public List<AuditLogDto> getRecentActivity(int limit) {
        Page<AuditLog> page = auditLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit));
        return page.getContent().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<AuditLogDto> getUserActivity(Long userId) {
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private AuditLogDto toDto(AuditLog log) {
        AuditLogDto dto = new AuditLogDto();
        dto.setId(log.getId());
        dto.setUserId(log.getUserId());
        dto.setAction(log.getAction());
        dto.setEntityType(log.getEntityType());
        dto.getEntityId();
        dto.setEntityId(log.getEntityId());
        dto.setDetails(log.getDetails());
        dto.setIpAddress(log.getIpAddress());
        dto.setCreatedAt(log.getCreatedAt());

        if (log.getUserId() != null) {
            userRepository.findById(log.getUserId()).ifPresent(u -> dto.setUserName(u.getName()));
        }
        return dto;
    }
}
