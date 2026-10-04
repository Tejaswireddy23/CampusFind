package com.findback.controller;

import com.findback.dto.DashboardStatsDto;
import com.findback.dto.ItemRequest;
import com.findback.dto.ItemResponse;
import com.findback.model.ItemStatus;
import com.findback.model.ItemType;
import com.findback.model.User;
import com.findback.dto.DuplicateCheckRequest;
import com.findback.dto.DuplicateCheckResponse;
import com.findback.service.DuplicateDetectionService;
import com.findback.service.FileStorageService;
import com.findback.service.ItemService;
import com.findback.service.LocationService;
import com.findback.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @Autowired
    private UserService userService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private DuplicateDetectionService duplicateDetectionService;

    @Autowired
    private LocationService locationService;

    @GetMapping({"", "/search"})
    public ResponseEntity<Page<ItemResponse>> searchItems(
            @RequestParam(required = false) ItemType type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) ItemStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "newest") String sort) {

        Sort sortObj = "oldest".equalsIgnoreCase(sort)
                ? Sort.by("createdAt").ascending()
                : Sort.by("createdAt").descending();

        Pageable pageable = PageRequest.of(page, size, sortObj);

        return ResponseEntity.ok(itemService.searchItems(
                type, category, status, location, brand, color, startDate, endDate, query, pageable
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> getItem(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getItemById(id));
    }

    @PostMapping
    public ResponseEntity<ItemResponse> createItem(@Valid @RequestBody ItemRequest request, Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        if (request.getType() == null) {
            request.setType(ItemType.LOST);
        }
        return ResponseEntity.ok(itemService.createItem(request, user));
    }

    @PostMapping("/lost")
    public ResponseEntity<ItemResponse> reportLostItem(@Valid @RequestBody ItemRequest request, Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        request.setType(ItemType.LOST);
        return ResponseEntity.ok(itemService.createItem(request, user));
    }

    @PostMapping("/found")
    public ResponseEntity<ItemResponse> reportFoundItem(@Valid @RequestBody ItemRequest request, Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        request.setType(ItemType.FOUND);
        return ResponseEntity.ok(itemService.createItem(request, user));
    }

    @PutMapping("/{id}/recover")
    public ResponseEntity<ItemResponse> markAsRecovered(@PathVariable Long id, Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(itemService.markAsRecovered(id, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemResponse> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody ItemRequest request,
            Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(itemService.updateItem(id, request, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteItem(@PathVariable Long id, Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        itemService.deleteItem(id, user);
        return ResponseEntity.ok(Collections.singletonMap("message", "Item deleted successfully"));
    }

    @GetMapping("/my-reports")
    public ResponseEntity<Page<ItemResponse>> getMyReports(
            @RequestParam(required = false) ItemType type,
            @RequestParam(required = false) ItemStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(itemService.getUserItems(user.getId(), type, status, pageable));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats(Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(itemService.getUserDashboardStats(user.getId()));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String fileUrl = fileStorageService.storeFile(file);
        return ResponseEntity.ok(Collections.singletonMap("imageUrl", fileUrl));
    }

    @PostMapping("/check-duplicate")
    public ResponseEntity<DuplicateCheckResponse> checkDuplicate(@RequestBody DuplicateCheckRequest request) {
        return ResponseEntity.ok(duplicateDetectionService.checkForDuplicates(request));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<ItemResponse>> getNearbyItems(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(defaultValue = "10") Double radiusKm,
            @RequestParam(required = false) ItemType type,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(locationService.findNearbyItems(lat, lon, radiusKm, type, category));
    }
}
