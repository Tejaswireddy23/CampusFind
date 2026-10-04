package com.findback.controller;

import com.findback.dto.CampusLocationDto;
import com.findback.service.CampusLocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/campus-locations")
public class CampusLocationController {

    @Autowired
    private CampusLocationService campusLocationService;

    @GetMapping
    public ResponseEntity<List<CampusLocationDto>> getAllLocations(
            @RequestParam(required = false, defaultValue = "false") boolean all) {
        if (all) {
            return ResponseEntity.ok(campusLocationService.getAllLocations());
        }
        return ResponseEntity.ok(campusLocationService.getActiveLocations());
    }

    @GetMapping("/distribution")
    public ResponseEntity<List<Map<String, Object>>> getLocationDistribution() {
        return ResponseEntity.ok(campusLocationService.getLocationDistribution());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CampusLocationDto> createLocation(@RequestBody CampusLocationDto dto) {
        return ResponseEntity.ok(campusLocationService.createLocation(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CampusLocationDto> updateLocation(
            @PathVariable Long id,
            @RequestBody CampusLocationDto dto) {
        return ResponseEntity.ok(campusLocationService.updateLocation(id, dto));
    }

    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CampusLocationDto> toggleLocationActive(@PathVariable Long id) {
        return ResponseEntity.ok(campusLocationService.toggleLocationActive(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteLocation(@PathVariable Long id) {
        campusLocationService.deleteLocation(id);
        return ResponseEntity.ok(Collections.singletonMap("message", "Location disabled successfully"));
    }
}
