package com.findback.dto;

import com.findback.model.MatchStatus;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class MatchResponse {
    private Long id;
    private ItemResponse lostItem;
    private ItemResponse foundItem;
    private Integer matchScore;
    private String matchReasons;
    private List<String> matchingAttributes = new ArrayList<>();
    private List<String> nonMatchingAttributes = new ArrayList<>();
    private MatchStatus status;
    private Boolean isSaved = false;
    private LocalDateTime createdAt;

    public MatchResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ItemResponse getLostItem() { return lostItem; }
    public void setLostItem(ItemResponse lostItem) { this.lostItem = lostItem; }

    public ItemResponse getFoundItem() { return foundItem; }
    public void setFoundItem(ItemResponse foundItem) { this.foundItem = foundItem; }

    public Integer getMatchScore() { return matchScore; }
    public void setMatchScore(Integer matchScore) { this.matchScore = matchScore; }

    public String getMatchReasons() { return matchReasons; }
    public void setMatchReasons(String matchReasons) { this.matchReasons = matchReasons; }

    public List<String> getMatchingAttributes() { return matchingAttributes; }
    public void setMatchingAttributes(List<String> matchingAttributes) { this.matchingAttributes = matchingAttributes; }

    public List<String> getNonMatchingAttributes() { return nonMatchingAttributes; }
    public void setNonMatchingAttributes(List<String> nonMatchingAttributes) { this.nonMatchingAttributes = nonMatchingAttributes; }

    public MatchStatus getStatus() { return status; }
    public void setStatus(MatchStatus status) { this.status = status; }

    public Boolean getIsSaved() { return isSaved; }
    public void setIsSaved(Boolean isSaved) { this.isSaved = isSaved; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
