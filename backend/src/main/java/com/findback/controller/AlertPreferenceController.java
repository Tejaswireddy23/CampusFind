package com.findback.controller;

import com.findback.dto.AlertPreferenceDto;
import com.findback.model.User;
import com.findback.service.AlertPreferenceService;
import com.findback.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alert-preferences")
public class AlertPreferenceController {

    @Autowired
    private AlertPreferenceService alertPreferenceService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<AlertPreferenceDto> getPreferences(Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(alertPreferenceService.getPreferences(user));
    }

    @PutMapping
    public ResponseEntity<AlertPreferenceDto> updatePreferences(
            @RequestBody AlertPreferenceDto dto,
            Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(alertPreferenceService.updatePreferences(dto, user));
    }
}
