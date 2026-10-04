package com.findback.dto;

import java.util.List;

public class DashboardStatsDto {
    private long totalReports;
    private long lostItems;
    private long foundItems;
    private long matchedItems;
    private long returnedItems;
    private long unreadNotifications;
    private List<ItemResponse> recentReports;
    private List<AuditLogDto> recentActivity;

    public DashboardStatsDto() {}

    public long getTotalReports() { return totalReports; }
    public void setTotalReports(long totalReports) { this.totalReports = totalReports; }

    public long getLostItems() { return lostItems; }
    public void setLostItems(long lostItems) { this.lostItems = lostItems; }
    public long getMyLostReports() { return lostItems; }

    public long getFoundItems() { return foundItems; }
    public void setFoundItems(long foundItems) { this.foundItems = foundItems; }
    public long getMyFoundReports() { return foundItems; }

    public long getMatchedItems() { return matchedItems; }
    public void setMatchedItems(long matchedItems) { this.matchedItems = matchedItems; }
    public long getPotentialMatches() { return matchedItems; }

    public long getReturnedItems() { return returnedItems; }
    public void setReturnedItems(long returnedItems) { this.returnedItems = returnedItems; }
    public long getRecoveredItems() { return returnedItems; }

    public long getUnreadNotifications() { return unreadNotifications; }
    public void setUnreadNotifications(long unreadNotifications) { this.unreadNotifications = unreadNotifications; }
    public long getUnreadAlerts() { return unreadNotifications; }

    public List<ItemResponse> getRecentReports() { return recentReports; }
    public void setRecentReports(List<ItemResponse> recentReports) { this.recentReports = recentReports; }

    public List<AuditLogDto> getRecentActivity() { return recentActivity; }
    public void setRecentActivity(List<AuditLogDto> recentActivity) { this.recentActivity = recentActivity; }
}
