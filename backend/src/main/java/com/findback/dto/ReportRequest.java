package com.findback.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class ReportRequest {
    private Long reportedUserId;
    private Long itemId;

    @NotBlank(message = "Reason is required")
    private String reason; // Fake item, Scam, Spam, Wrong information, Suspicious claim, Harassment

    @NotBlank(message = "Description is required")
    private String description;

    public ReportRequest() {}

    public Long getReportedUserId() { return reportedUserId; }
    public void setReportedUserId(Long reportedUserId) { this.reportedUserId = reportedUserId; }

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
