package com.findback.dto;

import java.util.ArrayList;
import java.util.List;

public class DuplicateCheckResponse {
    private boolean hasSimilarReport;
    private int highestSimilarityScore;
    private String reason;
    private List<ItemResponse> similarItems = new ArrayList<>();

    public DuplicateCheckResponse() {}

    public DuplicateCheckResponse(boolean hasSimilarReport, int highestSimilarityScore, String reason, List<ItemResponse> similarItems) {
        this.hasSimilarReport = hasSimilarReport;
        this.highestSimilarityScore = highestSimilarityScore;
        this.reason = reason;
        this.similarItems = similarItems != null ? similarItems : new ArrayList<>();
    }

    public boolean isHasSimilarReport() { return hasSimilarReport; }
    public void setHasSimilarReport(boolean hasSimilarReport) { this.hasSimilarReport = hasSimilarReport; }

    public boolean isHasSimilarReports() { return hasSimilarReport; }
    public void setHasSimilarReports(boolean hasSimilarReports) { this.hasSimilarReport = hasSimilarReports; }

    public int getHighestSimilarityScore() { return highestSimilarityScore; }
    public void setHighestSimilarityScore(int highestSimilarityScore) { this.highestSimilarityScore = highestSimilarityScore; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public List<ItemResponse> getSimilarItems() { return similarItems; }
    public void setSimilarItems(List<ItemResponse> similarItems) { this.similarItems = similarItems; }

    public List<ItemResponse> getSimilarReports() { return similarItems; }
    public void setSimilarReports(List<ItemResponse> similarReports) { this.similarItems = similarReports; }
}
