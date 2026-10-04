package com.findback.dto;

import java.time.LocalDateTime;

public class UserDto {
    private Long id;
    private String studentId;
    private String name;
    private String email;
    private String phone;
    private String department;
    private String year;
    private String section;
    private String role;
    private String avatarUrl;
    private String status;
    private LocalDateTime approvedAt;
    private String approvedBy;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private long reportsCount;
    private long returnedCount;
    private long itemsFoundCount;
    private long successfulClaimsCount;
    private long recoveredCount;
    private boolean trustedContributor;
    private String helperBadge;

    public UserDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public long getReportsCount() { return reportsCount; }
    public void setReportsCount(long reportsCount) { this.reportsCount = reportsCount; }

    public long getReturnedCount() { return returnedCount; }
    public void setReturnedCount(long returnedCount) { this.returnedCount = returnedCount; }

    public long getItemsFoundCount() { return itemsFoundCount; }
    public void setItemsFoundCount(long itemsFoundCount) { this.itemsFoundCount = itemsFoundCount; }

    public long getSuccessfulClaimsCount() { return successfulClaimsCount; }
    public void setSuccessfulClaimsCount(long successfulClaimsCount) { this.successfulClaimsCount = successfulClaimsCount; }

    public long getRecoveredCount() { return recoveredCount; }
    public void setRecoveredCount(long recoveredCount) { this.recoveredCount = recoveredCount; }

    public boolean isTrustedContributor() { return trustedContributor; }
    public void setTrustedContributor(boolean trustedContributor) { this.trustedContributor = trustedContributor; }

    public String getHelperBadge() { return helperBadge; }
    public void setHelperBadge(String helperBadge) { this.helperBadge = helperBadge; }
}
