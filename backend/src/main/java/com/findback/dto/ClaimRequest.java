package com.findback.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;

public class ClaimRequest {
    @NotNull(message = "Item ID is required")
    private Long itemId;

    private Long matchId;

    // Map of question -> answer
    private Map<String, String> verificationAnswers;

    private String additionalNotes;

    public ClaimRequest() {}

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }

    public Map<String, String> getVerificationAnswers() { return verificationAnswers; }
    public void setVerificationAnswers(Map<String, String> verificationAnswers) { this.verificationAnswers = verificationAnswers; }

    public String getAdditionalNotes() { return additionalNotes; }
    public void setAdditionalNotes(String additionalNotes) { this.additionalNotes = additionalNotes; }
}
