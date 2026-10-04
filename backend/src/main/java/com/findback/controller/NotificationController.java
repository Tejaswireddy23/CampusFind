package com.findback.controller;

import com.findback.dto.NotificationDto;
import com.findback.model.User;
import com.findback.service.NotificationService;
import com.findback.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getNotifications(Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        long count = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(Collections.singletonMap("count", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(@PathVariable Long id, Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(Collections.singletonMap("message", "Marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(Collections.singletonMap("message", "All marked as read"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable Long id, Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        notificationService.deleteNotification(id, user.getId());
        return ResponseEntity.ok(Collections.singletonMap("message", "Notification deleted"));
    }
}
