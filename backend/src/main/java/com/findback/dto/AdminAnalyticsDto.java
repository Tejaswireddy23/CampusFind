package com.findback.dto;

import java.util.List;
import java.util.Map;

public class AdminAnalyticsDto {
    private Map<String, Long> lostVsFound;
    private Map<String, Long> itemsByCategory;
    private Map<String, Long> reportsByMonth;
    private double recoveryRate;
    private double averageRecoveryTimeDays;
    private List<Map<String, Object>> topReportingLocations;
    private double claimSuccessRate;

    public AdminAnalyticsDto() {}

    public Map<String, Long> getLostVsFound() { return lostVsFound; }
    public void setLostVsFound(Map<String, Long> lostVsFound) { this.lostVsFound = lostVsFound; }

    public Map<String, Long> getItemsByCategory() { return itemsByCategory; }
    public void setItemsByCategory(Map<String, Long> itemsByCategory) { this.itemsByCategory = itemsByCategory; }

    public Map<String, Long> getReportsByMonth() { return reportsByMonth; }
    public void setReportsByMonth(Map<String, Long> reportsByMonth) { this.reportsByMonth = reportsByMonth; }

    public double getRecoveryRate() { return recoveryRate; }
    public void setRecoveryRate(double recoveryRate) { this.recoveryRate = recoveryRate; }

    public double getAverageRecoveryTimeDays() { return averageRecoveryTimeDays; }
    public void setAverageRecoveryTimeDays(double averageRecoveryTimeDays) { this.averageRecoveryTimeDays = averageRecoveryTimeDays; }

    public List<Map<String, Object>> getTopReportingLocations() { return topReportingLocations; }
    public void setTopReportingLocations(List<Map<String, Object>> topReportingLocations) { this.topReportingLocations = topReportingLocations; }

    public double getClaimSuccessRate() { return claimSuccessRate; }
    public void setClaimSuccessRate(double claimSuccessRate) { this.claimSuccessRate = claimSuccessRate; }
}
