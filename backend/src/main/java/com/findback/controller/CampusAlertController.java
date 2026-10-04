package com.findback.controller;

import com.findback.dto.CampusAlertDto;
import com.findback.model.User;
import com.findback.service.CampusAlertService;
import com.findback.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/campus-alerts")
public class CampusAlertController {

    @Autowired
    private CampusAlertService alertService;

    @Autowired
    private UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CampusAlertDto> createAlert(
            @Valid @RequestBody CampusAlertDto request,
            Authentication authentication) {
        User admin = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(alertService.createAlert(request, admin));
    }

    @GetMapping
    public ResponseEntity<Page<CampusAlertDto>> getAlertsForUser(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(alertService.getAlertsForUser(user, pageable));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<CampusAlertDto>> getAllAlerts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(alertService.getAllAlerts(pageable));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAlert(
            @PathVariable Long id,
            Authentication authentication) {
        User admin = userService.getCurrentUser(authentication.getName());
        alertService.deleteAlert(id, admin);
        return ResponseEntity.ok().build();
    }
}
