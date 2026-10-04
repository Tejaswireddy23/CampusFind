package com.findback.dto;

import jakarta.validation.constraints.NotBlank;

public class ClaimReviewRequest {
    @NotBlank(message = "Action is required (APPROVE, REJECT, REQUEST_INFO, UNDER_REVIEW)")
    private String action;

    private String notes;

    public ClaimReviewRequest() {}

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
