package com.findback.controller;

import com.findback.dto.*;
import com.findback.model.User;
import com.findback.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private ReportService reportService;

    @Autowired
    private FraudDetectionService fraudDetectionService;

    @Autowired
    private UserService userService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDto> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/analytics")
    public ResponseEntity<AdminAnalyticsDto> getAnalytics() {
        return ResponseEntity.ok(adminService.getAnalytics());
    }

    @GetMapping("/users")
    public ResponseEntity<Page<UserDto>> getUsers(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(adminService.getUsers(query, pageable));
    }

    @GetMapping("/students")
    public ResponseEntity<Page<UserDto>> getStudents(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(userService.getStudents(status, query, pageable));
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<UserDto> getStudentDetails(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getStudentById(id));
    }

    @PutMapping("/students/{id}/approve")
    public ResponseEntity<UserDto> approveStudent(
            @PathVariable Long id,
            Authentication authentication) {
        User admin = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(userService.approveStudent(id, admin));
    }

    @PutMapping("/students/{id}/reject")
    public ResponseEntity<UserDto> rejectStudent(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {
        User admin = userService.getCurrentUser(authentication.getName());
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(userService.rejectStudent(id, reason, admin));
    }

    @PutMapping("/students/{id}/suspend")
    public ResponseEntity<UserDto> suspendStudent(
            @PathVariable Long id,
            Authentication authentication) {
        User admin = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(userService.suspendStudent(id, admin));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserDto> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        User admin = userService.getCurrentUser(authentication.getName());
        String status = body.get("status");
        return ResponseEntity.ok(adminService.updateUserStatus(id, status, admin));
    }

    @GetMapping("/items")
    public ResponseEntity<Page<ItemResponse>> getItemsForModeration(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(adminService.getAllItemsForModeration(pageable));
    }

    @PutMapping("/items/{id}/moderate")
    public ResponseEntity<ItemResponse> moderateItem(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        User admin = userService.getCurrentUser(authentication.getName());
        String status = body.get("status"); // APPROVED, REJECTED
        String reason = body.get("reason"); // Spam, Fake listing, Inappropriate content, Duplicate, Suspicious activity
        return ResponseEntity.ok(adminService.moderateItem(id, status, reason, admin));
    }

    @GetMapping("/community-reports")
    public ResponseEntity<Page<ReportResponse>> getReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(reportService.getAllReports(pageable));
    }

    @PutMapping("/community-reports/{id}/status")
    public ResponseEntity<ReportResponse> updateReportStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        User admin = userService.getCurrentUser(authentication.getName());
        String status = body.get("status");
        return ResponseEntity.ok(reportService.updateReportStatus(id, status, admin));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AuditLogDto>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(adminService.getAuditLogs(pageable));
    }

    @GetMapping("/fraud-alerts")
    public ResponseEntity<List<FraudAlertDto>> getFraudAlerts() {
        return ResponseEntity.ok(fraudDetectionService.detectSuspiciousActivities());
    }
}
