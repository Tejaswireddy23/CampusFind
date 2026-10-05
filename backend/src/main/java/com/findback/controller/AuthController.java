package com.findback.controller;

import com.findback.dto.AuthRequest;
import com.findback.dto.AuthResponse;
import com.findback.dto.RegisterRequest;
import com.findback.dto.UserDto;
import com.findback.model.User;
import com.findback.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest req) {
        String ip = req.getRemoteAddr();
        return ResponseEntity.ok(userService.register(request, ip));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request, HttpServletRequest req) {
        String ip = req.getRemoteAddr();
        logger.info("Authentication request received for identifier: {}", request.getLoginIdentifier());
        return ResponseEntity.ok(userService.login(request, ip));
    }

    @GetMapping("/status")
    public ResponseEntity<UserDto> getAccountStatus(@RequestParam String identifier) {
        return ResponseEntity.ok(userService.getAccountStatus(identifier));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        User user = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(userService.toUserDto(user));
    }
}
