package com.findback.dto;

import java.time.LocalDateTime;

public class ReturnResponse {
    private Long id;
    private Long claimId;
    private Long lostItemId;
    private String lostItemTitle;
    private Long foundItemId;
    private String foundItemTitle;
    private Long ownerId;
    private String ownerName;
    private Long finderId;
    private String finderName;
    private LocalDateTime returnDate;
    private String handoverNotes;
    private String status;

    public ReturnResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getClaimId() { return claimId; }
    public void setClaimId(Long claimId) { this.claimId = claimId; }

    public Long getLostItemId() { return lostItemId; }
    public void setLostItemId(Long lostItemId) { this.lostItemId = lostItemId; }

    public String getLostItemTitle() { return lostItemTitle; }
    public void setLostItemTitle(String lostItemTitle) { this.lostItemTitle = lostItemTitle; }

    public Long getFoundItemId() { return foundItemId; }
    public void setFoundItemId(Long foundItemId) { this.foundItemId = foundItemId; }

    public String getFoundItemTitle() { return foundItemTitle; }
    public void setFoundItemTitle(String foundItemTitle) { this.foundItemTitle = foundItemTitle; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public Long getFinderId() { return finderId; }
    public void setFinderId(Long finderId) { this.finderId = finderId; }

    public String getFinderName() { return finderName; }
    public void setFinderName(String finderName) { this.finderName = finderName; }

    public LocalDateTime getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDateTime returnDate) { this.returnDate = returnDate; }

    public String getHandoverNotes() { return handoverNotes; }
    public void setHandoverNotes(String handoverNotes) { this.handoverNotes = handoverNotes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
