package com.findback.controller;

import com.findback.dto.ClaimRequest;
import com.findback.dto.ClaimResponse;
import com.findback.dto.ClaimReviewRequest;
import com.findback.dto.ReturnConfirmRequest;
import com.findback.dto.ReturnResponse;
import com.findback.model.User;
import com.findback.service.ClaimService;
import com.findback.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {

    @Autowired
    private ClaimService claimService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<ClaimResponse> createClaim(@Valid @RequestBody ClaimRequest request, Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(claimService.createClaim(request, user));
    }

    @GetMapping
    public ResponseEntity<List<ClaimResponse>> getUserClaims(Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(claimService.getUserClaims(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClaimResponse> getClaimById(@PathVariable Long id, Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(claimService.getClaimById(id, user));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<ClaimResponse> reviewClaim(
            @PathVariable Long id,
            @Valid @RequestBody ClaimReviewRequest request,
            Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(claimService.reviewClaim(id, request, user));
    }

    @PostMapping("/{id}/confirm-return")
    public ResponseEntity<ReturnResponse> confirmReturn(
            @PathVariable Long id,
            @Valid @RequestBody ReturnConfirmRequest request,
            Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(claimService.confirmReturn(id, request, user));
    }
}
