package com.findback.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "claimant_id", nullable = false)
    private User claimant;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "match_id")
    private Match match;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ClaimStatus status = ClaimStatus.PENDING;

    @Column(name = "verification_answers", columnDefinition = "TEXT")
    private String verificationAnswers;

    @Column(name = "additional_notes", columnDefinition = "TEXT")
    private String additionalNotes;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "finder_confirmed_handover")
    private Boolean finderConfirmedHandover = false;

    @Column(name = "owner_confirmed_receipt")
    private Boolean ownerConfirmedReceipt = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Claim() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = ClaimStatus.PENDING;
        if (this.finderConfirmedHandover == null) this.finderConfirmedHandover = false;
        if (this.ownerConfirmedReceipt == null) this.ownerConfirmedReceipt = false;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Item getItem() { return item; }
    public void setItem(Item item) { this.item = item; }

    public User getClaimant() { return claimant; }
    public void setClaimant(User claimant) { this.claimant = claimant; }

    public Match getMatch() { return match; }
    public void setMatch(Match match) { this.match = match; }

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
