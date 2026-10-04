package com.findback.controller;

import com.findback.dto.ItemResponse;
import com.findback.model.ItemStatus;
import com.findback.model.ItemType;
import com.findback.model.User;
import com.findback.service.AdminReportService;
import com.findback.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportController {

    @Autowired
    private AdminReportService adminReportService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<Page<ItemResponse>> getAllReports(
            @RequestParam(required = false) ItemType type,
            @RequestParam(required = false) ItemStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "newest") String sort) {

        Sort sortObj = "oldest".equalsIgnoreCase(sort)
                ? Sort.by("createdAt").ascending()
                : Sort.by("createdAt").descending();

        Pageable pageable = PageRequest.of(page, size, sortObj);

        return ResponseEntity.ok(adminReportService.getAllReports(type, status, location, category, query, pageable));
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<ItemResponse> verifyReport(
            @PathVariable Long id,
            Authentication authentication) {
        User admin = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(adminReportService.verifyReport(id, admin));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ItemResponse> updateReportStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        User admin = userService.getCurrentUser(authentication.getName());
        String status = body.get("status");
        String reason = body.get("reason");
        return ResponseEntity.ok(adminReportService.updateReportStatus(id, status, reason, admin));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> removeReport(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            Authentication authentication) {
        User admin = userService.getCurrentUser(authentication.getName());
        adminReportService.removeReport(id, reason, admin);
        return ResponseEntity.ok(Collections.singletonMap("message", "Report removed successfully"));
    }
}
