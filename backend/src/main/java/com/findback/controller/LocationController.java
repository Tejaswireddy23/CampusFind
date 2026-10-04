package com.findback.controller;

import com.findback.dto.LocationPreferenceDto;
import com.findback.model.User;
import com.findback.service.LocationService;
import com.findback.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/location")
public class LocationController {

    @Autowired
    private LocationService locationService;

    @Autowired
    private UserService userService;

    @PostMapping("/preferences")
    public ResponseEntity<LocationPreferenceDto> savePreferences(
            @Valid @RequestBody LocationPreferenceDto dto,
            Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(locationService.savePreference(dto, user));
    }

    @GetMapping("/preferences")
    public ResponseEntity<LocationPreferenceDto> getPreferences(Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        LocationPreferenceDto dto = locationService.getPreference(user.getId());
        return ResponseEntity.ok(dto);
    }
}
