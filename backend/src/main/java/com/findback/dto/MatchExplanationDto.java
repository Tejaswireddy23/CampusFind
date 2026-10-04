package com.findback.dto;

import java.util.ArrayList;
import java.util.List;

public class MatchExplanationDto {
    private int matchScore;
    private List<String> matchingAttributes = new ArrayList<>();
    private List<String> nonMatchingAttributes = new ArrayList<>();

    public MatchExplanationDto() {}

    public MatchExplanationDto(int matchScore, List<String> matchingAttributes, List<String> nonMatchingAttributes) {
        this.matchScore = matchScore;
        this.matchingAttributes = matchingAttributes != null ? matchingAttributes : new ArrayList<>();
        this.nonMatchingAttributes = nonMatchingAttributes != null ? nonMatchingAttributes : new ArrayList<>();
    }

    public int getMatchScore() { return matchScore; }
    public void setMatchScore(int matchScore) { this.matchScore = matchScore; }

    public List<String> getMatchingAttributes() { return matchingAttributes; }
    public void setMatchingAttributes(List<String> matchingAttributes) { this.matchingAttributes = matchingAttributes; }

    public List<String> getNonMatchingAttributes() { return nonMatchingAttributes; }
    public void setNonMatchingAttributes(List<String> nonMatchingAttributes) { this.nonMatchingAttributes = nonMatchingAttributes; }
}
