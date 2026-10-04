package com.findback.dto;

import java.time.LocalDateTime;

public class FraudAlertDto {
    private String id;
    private String severity; // HIGH, MEDIUM, LOW
    private String type; // MULTIPLE_CLAIMS_ONE_ITEM, REPEATED_DUPLICATE_REPORTS, RAPID_REPORT_BURST, REPEATED_REJECTED_CLAIMS
    private String title;
    private String reason;
    private String entityType; // ITEM, USER, CLAIM
    private Long entityId;
    private Long userId;
    private String userName;
    private long count;
    private LocalDateTime detectedAt;

    public FraudAlertDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }

    public LocalDateTime getDetectedAt() { return detectedAt; }
    public void setDetectedAt(LocalDateTime detectedAt) { this.detectedAt = detectedAt; }
}
