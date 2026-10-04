package com.findback.service;

import com.findback.dto.ItemResponse;
import com.findback.exception.ResourceNotFoundException;
import com.findback.model.Item;
import com.findback.model.ItemStatus;
import com.findback.model.ItemType;
import com.findback.model.ModerationStatus;
import com.findback.model.NotificationType;
import com.findback.model.User;
import com.findback.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminReportService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private ItemService itemService;

    @Autowired
    private AuditService auditService;

    @Autowired
    private NotificationService notificationService;

    public Page<ItemResponse> getAllReports(
            ItemType type,
            ItemStatus status,
            String location,
            String category,
            String query,
            Pageable pageable) {

        Page<Item> page = itemRepository.searchItems(
                type,
                (category != null && !category.isBlank()) ? category : null,
                status,
                null, // Allow viewing all moderation statuses
                (location != null && !location.isBlank()) ? location : null,
                null,
                null,
                null,
                null,
                (query != null && !query.isBlank()) ? query : null,
                pageable
        );

        return page.map(itemService::toResponse);
    }

    @Transactional
    public ItemResponse verifyReport(Long id, User admin) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id " + id));

        item.setModerationStatus(ModerationStatus.VERIFIED);
        if (item.getStatus() == null || item.getStatus() == ItemStatus.PENDING_VERIFICATION || item.getStatus() == ItemStatus.VERIFICATION_PENDING) {
            item.setStatus(ItemStatus.ACTIVE);
        }
        item = itemRepository.save(item);

        auditService.log(admin.getId(), "ADMIN_VERIFY_REPORT", "ITEM", item.getId(),
                "Verified campus report: " + item.getTitle(), null);

        if (item.getUser() != null) {
            notificationService.createNotification(
                    item.getUser().getId(),
                    "Campus Report Verified",
                    "Your report '" + item.getTitle() + "' has been verified by the campus administrator.",
                    NotificationType.REPORT_VERIFIED,
                    "/items/" + item.getId()
            );
        }

        return itemService.toResponse(item);
    }

    @Transactional
    public ItemResponse updateReportStatus(Long id, String statusStr, String reason, User admin) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id " + id));

        try {
            ItemStatus newStatus = ItemStatus.valueOf(statusStr.toUpperCase());
            item.setStatus(newStatus);
        } catch (IllegalArgumentException e) {
            // Check if it's a moderation status
            try {
                ModerationStatus modStatus = ModerationStatus.valueOf(statusStr.toUpperCase());
                item.setModerationStatus(modStatus);
            } catch (Exception ex) {
                // Default fallback
            }
        }

        if (reason != null && !reason.isBlank()) {
            item.setModerationReason(reason.trim());
        }

        item = itemRepository.save(item);

        auditService.log(admin.getId(), "ADMIN_UPDATE_REPORT_STATUS", "ITEM", item.getId(),
                "Updated report status to " + statusStr + (reason != null ? " (" + reason + ")" : ""), null);

        if (item.getUser() != null) {
            notificationService.createNotification(
                    item.getUser().getId(),
                    "Campus Report Status Updated",
                    "Your report '" + item.getTitle() + "' status has been updated to " + statusStr + ".",
                    NotificationType.STATUS_UPDATED,
                    "/items/" + item.getId()
            );
        }

        return itemService.toResponse(item);
    }

    @Transactional
    public void removeReport(Long id, String reason, User admin) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id " + id));

        item.setStatus(ItemStatus.REMOVED);
        item.setModerationStatus(ModerationStatus.REMOVED);
        if (reason != null && !reason.isBlank()) {
            item.setModerationReason(reason.trim());
        }
        itemRepository.save(item);

        auditService.log(admin.getId(), "ADMIN_REMOVE_REPORT", "ITEM", item.getId(),
                "Removed inappropriate report: " + item.getTitle() + (reason != null ? " Reason: " + reason : ""), null);

        if (item.getUser() != null) {
            notificationService.createNotification(
                    item.getUser().getId(),
                    "Campus Report Removed",
                    "Your report '" + item.getTitle() + "' was removed by administration." + (reason != null ? " Reason: " + reason : ""),
                    NotificationType.REPORT_REMOVED,
                    "/my-reports"
            );
        }
    }
}
