package com.findback.service;

import com.findback.dto.*;
import com.findback.exception.ResourceNotFoundException;
import com.findback.exception.UnauthorizedException;
import com.findback.model.*;
import com.findback.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private ItemReturnRepository itemReturnRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private MatchingService matchingService;

    @Autowired
    private AuditService auditService;

    @Transactional
    public ItemResponse createItem(ItemRequest request, User user) {
        Item item = new Item();
        item.setType(request.getType());
        item.setTitle(request.getTitle().trim());
        item.setCategory(request.getCategory().trim());
        item.setBrand(request.getBrand() != null ? request.getBrand().trim() : null);
        item.setModel(request.getModel() != null ? request.getModel().trim() : null);
        item.setColor(request.getColor() != null ? request.getColor().trim() : null);
        item.setDescription(request.getDescription().trim());
        item.setDateLostOrFound(request.getDateLostOrFound());
        item.setApproximateTime(request.getApproximateTime());
        item.setLocation(request.getLocation().trim());
        item.setLatitude(request.getLatitude());
        item.setLongitude(request.getLongitude());
        item.setAdditionalDetails(request.getAdditionalDetails());
        item.setReward(request.getReward());
        item.setImageUrl(request.getImageUrl());
        item.setStatus(ItemStatus.ACTIVE);
        item.setModerationStatus(ModerationStatus.APPROVED);
        item.setUser(user);

        item = itemRepository.save(item);

        auditService.log(user.getId(), "ITEM_REPORTED", "ITEM", item.getId(),
                "Reported " + item.getType() + " item: " + item.getTitle(), null);

        // Run smart matching engine asynchronously / immediately
        matchingService.checkForMatches(item);

        return toResponse(item);
    }

    public Page<ItemResponse> searchItems(
            ItemType type,
            String category,
            ItemStatus status,
            String location,
            String brand,
            String color,
            LocalDate startDate,
            LocalDate endDate,
            String query,
            Pageable pageable) {

        Page<Item> page = itemRepository.searchItems(
                type,
                (category != null && !category.isBlank()) ? category : null,
                status,
                ModerationStatus.APPROVED,
                (location != null && !location.isBlank()) ? location : null,
                (brand != null && !brand.isBlank()) ? brand : null,
                (color != null && !color.isBlank()) ? color : null,
                startDate,
                endDate,
                (query != null && !query.isBlank()) ? query : null,
                pageable
        );

        return page.map(this::toResponse);
    }

    public ItemResponse getItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id " + id));
        return toResponse(item);
    }

    public Item getItemEntity(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id " + id));
    }

    @Transactional
    public ItemResponse updateItem(Long id, ItemRequest request, User currentUser) {
        Item item = getItemEntity(id);

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isOwner = item.getUser().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new UnauthorizedException("You are not authorized to edit this item");
        }

        item.setTitle(request.getTitle().trim());
        item.setCategory(request.getCategory().trim());
        item.setBrand(request.getBrand() != null ? request.getBrand().trim() : null);
        item.setModel(request.getModel() != null ? request.getModel().trim() : null);
        item.setColor(request.getColor() != null ? request.getColor().trim() : null);
        item.setDescription(request.getDescription().trim());
        item.setDateLostOrFound(request.getDateLostOrFound());
        item.setApproximateTime(request.getApproximateTime());
        item.setLocation(request.getLocation().trim());
        item.setLatitude(request.getLatitude());
        item.setLongitude(request.getLongitude());
        item.setAdditionalDetails(request.getAdditionalDetails());
        item.setReward(request.getReward());
        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            item.setImageUrl(request.getImageUrl());
        }

        item = itemRepository.save(item);
        auditService.log(currentUser.getId(), "ITEM_UPDATED", "ITEM", item.getId(), "Updated item: " + item.getTitle(), null);
        return toResponse(item);
    }

    @Transactional
    public void deleteItem(Long id, User currentUser) {
        Item item = getItemEntity(id);

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isOwner = item.getUser().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new UnauthorizedException("You are not authorized to delete this item");
        }

        auditService.log(currentUser.getId(), "ITEM_DELETED", "ITEM", item.getId(), "Deleted item: " + item.getTitle(), null);
        itemRepository.delete(item);
    }

    @Transactional
    public ItemResponse markAsRecovered(Long id, User currentUser) {
        Item item = getItemEntity(id);

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isOwner = item.getUser().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new UnauthorizedException("You are not authorized to mark this item as recovered");
        }

        item.setStatus(ItemStatus.RECOVERED);
        item = itemRepository.save(item);

        auditService.log(currentUser.getId(), "ITEM_RECOVERED", "ITEM", item.getId(),
                "Marked item as recovered: " + item.getTitle(), null);

        // Notify user
        notificationService.createNotification(
                item.getUser().getId(),
                "CampusFind — Your item has been marked as recovered.",
                "Your " + item.getType().name().toLowerCase() + " item '" + item.getTitle() + "' has been marked as RECOVERED.",
                NotificationType.RECOVERY,
                "/items/" + item.getId()
        );

        return toResponse(item);
    }

    public Page<ItemResponse> getUserItems(Long userId, ItemType type, ItemStatus status, Pageable pageable) {
        Page<Item> page;
        if (type != null) {
            page = itemRepository.findByUserIdAndType(userId, type, pageable);
        } else if (status != null) {
            page = itemRepository.findByUserIdAndStatus(userId, status, pageable);
        } else {
            page = itemRepository.findByUserId(userId, pageable);
        }
        return page.map(this::toResponse);
    }

    public DashboardStatsDto getUserDashboardStats(Long userId) {
        DashboardStatsDto dto = new DashboardStatsDto();
        dto.setTotalReports(itemRepository.countByUserId(userId));
        dto.setLostItems(itemRepository.countByUserIdAndType(userId, ItemType.LOST));
        dto.setFoundItems(itemRepository.countByUserIdAndType(userId, ItemType.FOUND));
        dto.setMatchedItems(itemRepository.countByUserIdAndStatus(userId, ItemStatus.MATCHED));
        dto.setReturnedItems(itemReturnRepository.countByUserInvolved(userId));
        dto.setUnreadNotifications(notificationRepository.countByUserIdAndIsReadFalse(userId));

        List<Item> recent = itemRepository.findTop5ByUserIdOrderByCreatedAtDesc(userId);
        dto.setRecentReports(recent.stream().map(this::toResponse).collect(Collectors.toList()));
        dto.setRecentActivity(auditService.getUserActivity(userId).stream().limit(5).collect(Collectors.toList()));

        return dto;
    }

    public ItemResponse toResponse(Item item) {
        ItemResponse res = new ItemResponse();
        res.setId(item.getId());
        res.setType(item.getType());
        res.setTitle(item.getTitle());
        res.setCategory(item.getCategory());
        res.setBrand(item.getBrand());
        res.setModel(item.getModel());
        res.setColor(item.getColor());
        res.setDescription(item.getDescription());
        res.setDateLostOrFound(item.getDateLostOrFound());
        res.setApproximateTime(item.getApproximateTime());
        res.setLocation(item.getLocation());
        res.setLatitude(item.getLatitude());
        res.setLongitude(item.getLongitude());
        res.setAdditionalDetails(item.getAdditionalDetails());
        res.setReward(item.getReward());
        res.setImageUrl(item.getImageUrl());
        res.setStatus(item.getStatus());
        res.setModerationStatus(item.getModerationStatus());
        res.setModerationReason(item.getModerationReason());
        res.setCreatedAt(item.getCreatedAt());
        res.setUpdatedAt(item.getUpdatedAt());

        if (item.getUser() != null) {
            res.setUserId(item.getUser().getId());
            res.setUserName(item.getUser().getName());
            res.setUserAvatar(item.getUser().getAvatarUrl());
        }
        return res;
    }
}
