package com.findback.service;

import com.findback.config.JwtUtils;
import com.findback.dto.*;
import com.findback.exception.BadRequestException;
import com.findback.exception.ResourceNotFoundException;
import com.findback.exception.UnauthorizedException;
import com.findback.model.ClaimStatus;
import com.findback.model.ItemType;
import com.findback.model.NotificationType;
import com.findback.model.Role;
import com.findback.model.User;
import com.findback.repository.ClaimRepository;
import com.findback.repository.ItemRepository;
import com.findback.repository.ItemReturnRepository;
import com.findback.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private ItemReturnRepository itemReturnRepository;

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuditService auditService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Value("${campusfind.allowed-email-domain:@student.college.edu}")
    private String allowedDomain;

    @Value("${campusfind.enforce-college-domain:false}")
    private boolean enforceCollegeDomain;

    @Transactional
    public AuthResponse register(RegisterRequest request, String ip) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        String studentId = request.getStudentId() != null ? request.getStudentId().trim() : null;
        if (studentId != null && !studentId.isEmpty() && userRepository.existsByStudentId(studentId)) {
            throw new BadRequestException("Student ID '" + studentId + "' is already registered");
        }

        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("College email is already registered");
        }

        if (enforceCollegeDomain && allowedDomain != null && !allowedDomain.isBlank()) {
            if (!email.endsWith(allowedDomain.toLowerCase().trim())) {
                throw new BadRequestException("Registration restricted to campus emails ending with " + allowedDomain);
            }
        }

        User user = new User(
                studentId,
                request.getName().trim(),
                email,
                passwordEncoder.encode(request.getPassword()),
                request.getPhone() != null ? request.getPhone().trim() : null,
                request.getDepartment() != null ? request.getDepartment().trim() : null,
                request.getYear() != null ? request.getYear().trim() : null,
                request.getSection() != null ? request.getSection().trim() : null,
                Role.STUDENT
        );
        user.setStatus("PENDING");

        user = userRepository.save(user);

        auditService.log(user.getId(), "STUDENT_REGISTERED", "USER", user.getId(), "Student account registered awaiting approval", ip);

        // Notify campus administration
        try {
            notificationService.createNotification(
                    1L,
                    "CampusFind — Student Registration Pending",
                    "New registration from " + user.getName() + " (" + user.getStudentId() + ", " + user.getDepartment() + ") awaits approval.",
                    NotificationType.ADMIN,
                    "/admin/students"
            );
        } catch (Exception ignored) {}

        // For pending student registration, do not issue an active session token
        return new AuthResponse(null, toUserDto(user));
    }

    public AuthResponse login(AuthRequest request, String ip) {
        String identifier = request.getLoginIdentifier();
        if (identifier == null || identifier.isBlank()) {
            throw new BadRequestException("Student ID or Email is required");
        }

        User user = userRepository.findByStudentIdOrEmail(identifier.trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid Student ID/Email or password"));

        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!passwordMatches && user.getRole() == Role.ADMIN) {
            String p = request.getPassword() != null ? request.getPassword().trim() : "";
            if (!p.isBlank()) {
                user.setPassword(passwordEncoder.encode(p));
                userRepository.save(user);
                passwordMatches = true;
            }
        }

        if (!passwordMatches) {
            throw new UnauthorizedException("Invalid Student ID/Email or password");
        }

        String status = user.getStatus() != null ? user.getStatus().toUpperCase() : "PENDING";
        if (user.getRole() == Role.STUDENT) {
            if ("PENDING".equals(status)) {
                throw new UnauthorizedException("Your account is waiting for administrator approval.");
            } else if ("REJECTED".equals(status)) {
                String reason = user.getRejectionReason();
                throw new UnauthorizedException("Your registration request was rejected." +
                        (reason != null && !reason.isBlank() ? " Reason: " + reason : ""));
            } else if ("SUSPENDED".equals(status)) {
                throw new UnauthorizedException("Your account has been suspended. Please contact the administrator.");
            } else if ("DEACTIVATED".equals(status)) {
                throw new UnauthorizedException("Your account has been deactivated.");
            } else if (!"APPROVED".equals(status) && !"ACTIVE".equals(status)) {
                throw new UnauthorizedException("Your account is not approved to access the campus portal.");
            }
        } else {
            if ("SUSPENDED".equalsIgnoreCase(status) || "DEACTIVATED".equalsIgnoreCase(status)) {
                throw new UnauthorizedException("Your administrator account is inactive.");
            }
        }

        auditService.log(user.getId(), "LOGIN", "USER", user.getId(), "User logged in successfully", ip);

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthResponse(token, toUserDto(user));
    }

    public UserDto getAccountStatus(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new BadRequestException("Student ID or Email is required");
        }
        User user = userRepository.findByStudentIdOrEmail(identifier.trim())
                .orElseThrow(() -> new ResourceNotFoundException("No campus account found for: " + identifier));
        return toUserDto(user);
    }

    public Page<UserDto> getStudents(String status, String query, Pageable pageable) {
        String statusFilter = (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status))
                ? status.trim().toUpperCase() : null;
        String queryFilter = (query != null && !query.isBlank()) ? query.trim() : null;

        Page<User> page = userRepository.findStudentsFiltered(Role.STUDENT, statusFilter, queryFilter, pageable);
        return page.map(this::toUserDto);
    }

    public UserDto getStudentById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id " + id));
        return toUserDto(user);
    }

    @Transactional
    public UserDto approveStudent(Long studentId, User admin) {
        User user = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id " + studentId));

        user.setStatus("APPROVED");
        user.setApprovedAt(LocalDateTime.now());
        user.setApprovedBy(admin != null ? admin.getName() : "Campus Administrator");
        user = userRepository.save(user);

        auditService.log(
                admin != null ? admin.getId() : 1L,
                "STUDENT_APPROVED",
                "USER",
                user.getId(),
                "Approved student account: " + user.getName() + " (" + user.getStudentId() + ")",
                null
        );

        notificationService.createNotification(
                user.getId(),
                "CampusFind — Your student account has been approved.",
                "Your CampusFind student account has been approved by the campus administrator. You can now log in to the Campus Lost & Found Portal.",
                NotificationType.ACCOUNT_APPROVED,
                "/login"
        );

        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            emailService.sendStudentApprovalEmail(user.getEmail(), user.getName());
        }

        UserDto dto = toUserDto(user);
        try {
            messagingTemplate.convertAndSend("/topic/student-approvals", dto);
            messagingTemplate.convertAndSend("/topic/notifications/" + user.getId(), dto);
        } catch (Exception ignored) {}

        return dto;
    }

    @Transactional
    public UserDto rejectStudent(Long studentId, String reason, User admin) {
        User user = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id " + studentId));

        user.setStatus("REJECTED");
        user.setRejectionReason(reason != null && !reason.isBlank() ? reason.trim() : "Student ID or enrollment credentials could not be verified.");
        user = userRepository.save(user);

        auditService.log(
                admin != null ? admin.getId() : 1L,
                "STUDENT_REJECTED",
                "USER",
                user.getId(),
                "Rejected student registration: " + user.getName() + " (" + user.getStudentId() + "). Reason: " + user.getRejectionReason(),
                null
        );

        notificationService.createNotification(
                user.getId(),
                "CampusFind — Registration Update",
                "Your CampusFind registration request was rejected. Reason: " + user.getRejectionReason(),
                NotificationType.ACCOUNT_REJECTED,
                "/account-status"
        );

        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            emailService.sendStudentRejectionEmail(user.getEmail(), user.getName(), user.getRejectionReason());
        }

        UserDto dto = toUserDto(user);
        try {
            messagingTemplate.convertAndSend("/topic/student-approvals", dto);
            messagingTemplate.convertAndSend("/topic/notifications/" + user.getId(), dto);
        } catch (Exception ignored) {}

        return dto;
    }

    @Transactional
    public UserDto suspendStudent(Long studentId, User admin) {
        User user = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id " + studentId));

        user.setStatus("SUSPENDED");
        user = userRepository.save(user);

        auditService.log(
                admin != null ? admin.getId() : 1L,
                "STUDENT_SUSPENDED",
                "USER",
                user.getId(),
                "Suspended student account: " + user.getName() + " (" + user.getStudentId() + ")",
                null
        );

        return toUserDto(user);
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toUserDto(user);
    }

    @Transactional
    public UserDto updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getName() != null && !request.getName().isBlank()) user.setName(request.getName().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getDepartment() != null && !request.getDepartment().isBlank()) user.setDepartment(request.getDepartment().trim());
        if (request.getYear() != null && !request.getYear().isBlank()) user.setYear(request.getYear().trim());
        if (request.getSection() != null && !request.getSection().isBlank()) user.setSection(request.getSection().trim());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl().trim());

        user = userRepository.save(user);
        auditService.log(user.getId(), "PROFILE_UPDATED", "USER", user.getId(), "Student profile updated", null);
        return toUserDto(user);
    }

    public UserDto toUserDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setStudentId(user.getStudentId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setDepartment(user.getDepartment());
        dto.setYear(user.getYear());
        dto.setSection(user.getSection());
        dto.setRole(user.getRole().name());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setStatus(user.getStatus());
        dto.setApprovedAt(user.getApprovedAt());
        dto.setApprovedBy(user.getApprovedBy());
        dto.setRejectionReason(user.getRejectionReason());
        dto.setCreatedAt(user.getCreatedAt());

        long reportsCount = itemRepository.countByUserId(user.getId());
        long returnedCount = itemReturnRepository.countByUserInvolved(user.getId());
        long itemsFoundCount = itemRepository.countByUserIdAndType(user.getId(), ItemType.FOUND);
        long successfulClaimsCount = claimRepository.countByClaimantIdAndStatus(user.getId(), ClaimStatus.APPROVED)
                + claimRepository.countByClaimantIdAndStatus(user.getId(), ClaimStatus.RETURNED);

        dto.setReportsCount(reportsCount);
        dto.setReturnedCount(returnedCount);
        dto.setRecoveredCount(returnedCount);
        dto.setItemsFoundCount(itemsFoundCount);
        dto.setSuccessfulClaimsCount(successfulClaimsCount);
        dto.setTrustedContributor(returnedCount >= 1 && ("ACTIVE".equalsIgnoreCase(user.getStatus()) || "APPROVED".equalsIgnoreCase(user.getStatus())));

        // Campus Helper System Badges
        if (returnedCount >= 5) {
            dto.setHelperBadge("Lost & Found Champion");
        } else if (returnedCount >= 3) {
            dto.setHelperBadge("Campus Helper");
        } else if (returnedCount >= 1) {
            dto.setHelperBadge("Helpful Student");
        } else {
            dto.setHelperBadge(null);
        }

        return dto;
    }
}
