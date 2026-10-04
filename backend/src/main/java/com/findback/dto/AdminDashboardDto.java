package com.findback.dto;

public class AdminDashboardDto {
    private long totalUsers;
    private long totalLostItems;
    private long totalFoundItems;
    private long activeMatches;
    private long pendingClaims;
    private long returnedItems;
    private long reportedListings;
    private long suspiciousActivities;
    private long pendingVerification;
    private long totalRegisteredStudents;
    private long pendingStudentApprovals;
    private long approvedStudents;
    private long reportsThisMonth;

    public AdminDashboardDto() {}

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    public long getTotalStudents() { return totalUsers; }
    public void setTotalStudents(long totalStudents) { this.totalUsers = totalStudents; }

    public long getTotalRegisteredStudents() { return totalRegisteredStudents > 0 ? totalRegisteredStudents : totalUsers; }
    public void setTotalRegisteredStudents(long totalRegisteredStudents) { this.totalRegisteredStudents = totalRegisteredStudents; }

    public long getPendingStudentApprovals() { return pendingStudentApprovals; }
    public void setPendingStudentApprovals(long pendingStudentApprovals) { this.pendingStudentApprovals = pendingStudentApprovals; }

    public long getApprovedStudents() { return approvedStudents; }
    public void setApprovedStudents(long approvedStudents) { this.approvedStudents = approvedStudents; }

    public long getReportsThisMonth() { return reportsThisMonth; }
    public void setReportsThisMonth(long reportsThisMonth) { this.reportsThisMonth = reportsThisMonth; }

    public long getTotalLostItems() { return totalLostItems; }
    public void setTotalLostItems(long totalLostItems) { this.totalLostItems = totalLostItems; }

    public long getTotalFoundItems() { return totalFoundItems; }
    public void setTotalFoundItems(long totalFoundItems) { this.totalFoundItems = totalFoundItems; }

    public long getActiveMatches() { return activeMatches; }
    public void setActiveMatches(long activeMatches) { this.activeMatches = activeMatches; }

    public long getPendingClaims() { return pendingClaims; }
    public void setPendingClaims(long pendingClaims) { this.pendingClaims = pendingClaims; }

    public long getReturnedItems() { return returnedItems; }
    public void setReturnedItems(long returnedItems) { this.returnedItems = returnedItems; }
    public long getRecoveredItems() { return returnedItems; }
    public void setRecoveredItems(long recoveredItems) { this.returnedItems = recoveredItems; }

    public long getReportedListings() { return reportedListings; }
    public void setReportedListings(long reportedListings) { this.reportedListings = reportedListings; }

    public long getSuspiciousActivities() { return suspiciousActivities; }
    public void setSuspiciousActivities(long suspiciousActivities) { this.suspiciousActivities = suspiciousActivities; }

    public long getPendingVerification() { return pendingVerification; }
    public void setPendingVerification(long pendingVerification) { this.pendingVerification = pendingVerification; }
}
