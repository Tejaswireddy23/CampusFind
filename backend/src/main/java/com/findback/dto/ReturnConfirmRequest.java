package com.findback.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class ReturnConfirmRequest {
    @NotBlank(message = "Confirmation type is required (HANDOVER or RECEIPT)")
    private String confirmationType;

    private String notes;

    public ReturnConfirmRequest() {}

    public String getConfirmationType() { return confirmationType; }
    public void setConfirmationType(String confirmationType) { this.confirmationType = confirmationType; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
