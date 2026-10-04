package com.findback.service;

import com.findback.dto.NotificationDto;
import com.findback.model.Notification;
import com.findback.model.NotificationType;
import com.findback.model.User;
import com.findback.repository.NotificationRepository;
import com.findback.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public NotificationDto createNotification(Long userId, String title, String message, NotificationType type, String link) {
        User recipient = userRepository.findById(userId).orElse(null);
        if (recipient == null) return null;
        return createAndSend(recipient, title, message, type, link);
    }

    @Transactional
    public NotificationDto createNotification(User recipient, String title, String message, NotificationType type, String link) {
        return createAndSend(recipient, title, message, type, link);
    }

    @Transactional
    public NotificationDto createAndSend(User recipient, String title, String message, NotificationType type, String link) {
        // 1. Save to Database
        Notification notif = new Notification(recipient, title, message, type, link);
        notif = notificationRepository.save(notif);

        NotificationDto dto = toDto(notif);

        // 2. Broadcast via WebSocket live delivery
        try {
            messagingTemplate.convertAndSend("/topic/notifications/" + recipient.getId(), dto);
        } catch (Exception e) {
            logger.warn("WebSocket notification delivery failed for user {}: {}", recipient.getId(), e.getMessage());
        }

        return dto;
    }

    public List<NotificationDto> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUser().getId().equals(userId)) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUser().getId().equals(userId)) {
                notificationRepository.delete(n);
            }
        });
    }

    public NotificationDto toDto(Notification notif) {
        NotificationDto dto = new NotificationDto();
        dto.setId(notif.getId());
        dto.setUserId(notif.getUser().getId());
        dto.setTitle(notif.getTitle());
        dto.setMessage(notif.getMessage());
        dto.setType(notif.getType());
        dto.setLink(notif.getLink());
        dto.setIsRead(notif.getIsRead());
        dto.setCreatedAt(notif.getCreatedAt());
        return dto;
    }
}
