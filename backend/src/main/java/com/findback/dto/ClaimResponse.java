package com.findback.dto;

import com.findback.model.ClaimStatus;
import java.time.LocalDateTime;

public class ClaimResponse {
    private Long id;
    private ItemResponse item;
    private UserDto claimant;
    private Long matchId;
    private ClaimStatus status;
    private String verificationAnswers; // Exposed only to authorized claimant, finder, or admin
    private String additionalNotes;
    private String adminNotes;
    private Boolean finderConfirmedHandover;
    private Boolean ownerConfirmedReceipt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ClaimResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ItemResponse getItem() { return item; }
    public void setItem(ItemResponse item) { this.item = item; }

    public UserDto getClaimant() { return claimant; }
    public void setClaimant(UserDto claimant) { this.claimant = claimant; }

    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }

    public ClaimStatus getStatus() { return status; }
    public void setStatus(ClaimStatus status) { this.status = status; }

    public String getVerificationAnswers() { return verificationAnswers; }
    public void setVerificationAnswers(String verificationAnswers) { this.verificationAnswers = verificationAnswers; }

    public String getAdditionalNotes() { return additionalNotes; }
    public void setAdditionalNotes(String additionalNotes) { this.additionalNotes = additionalNotes; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public Boolean getFinderConfirmedHandover() { return finderConfirmedHandover; }
    public void setFinderConfirmedHandover(Boolean finderConfirmedHandover) { this.finderConfirmedHandover = finderConfirmedHandover; }

    public Boolean getOwnerConfirmedReceipt() { return ownerConfirmedReceipt; }
    public void setOwnerConfirmedReceipt(Boolean ownerConfirmedReceipt) { this.ownerConfirmedReceipt = ownerConfirmedReceipt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
