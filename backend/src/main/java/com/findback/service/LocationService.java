package com.findback.service;

import com.findback.dto.ItemResponse;
import com.findback.dto.LocationPreferenceDto;
import com.findback.model.*;
import com.findback.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class LocationService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserLocationPreferenceRepository preferenceRepository;

    @Autowired
    private ItemService itemService;

    public List<ItemResponse> findNearbyItems(Double lat, Double lon, Double radiusKm, ItemType type, String category) {
        if (radiusKm == null || radiusKm <= 0) radiusKm = 10.0;

        List<Item> allActive = itemRepository.findAll();
        List<ItemResponse> nearby = new ArrayList<>();

        for (Item item : allActive) {
            if (item.getStatus() != ItemStatus.ACTIVE && item.getStatus() != ItemStatus.MATCHED) {
                continue;
            }
            if (type != null && item.getType() != type) {
                continue;
            }
            if (category != null && !category.isBlank() && !"All Categories".equalsIgnoreCase(category)
                    && !category.equalsIgnoreCase(item.getCategory())) {
                continue;
            }

            Double itemLat = item.getLatitude();
            Double itemLon = item.getLongitude();

            // If coordinates exist, use Haversine distance
            if (lat != null && lon != null && itemLat != null && itemLon != null) {
                double dist = MatchingService.calculateDistanceKm(lat, lon, itemLat, itemLon);
                if (dist <= radiusKm) {
                    ItemResponse res = itemService.toResponse(item);
                    res.setDistanceKm(dist);
                    nearby.add(res);
                }
            } else {
                // If coordinates missing, include item with default distance if no strict coords requested
                ItemResponse res = itemService.toResponse(item);
                res.setDistanceKm(1.5); // Default approximate distance
                nearby.add(res);
            }
        }

        // Sort by closest distance first
        nearby.sort(Comparator.comparing(i -> i.getDistanceKm() != null ? i.getDistanceKm() : 999.0));
        return nearby;
    }

    @Transactional
    public LocationPreferenceDto savePreference(LocationPreferenceDto dto, User user) {
        UserLocationPreference pref = preferenceRepository.findByUserIdAndEnabledTrue(user.getId())
                .orElse(new UserLocationPreference());

        pref.setUser(user);
        pref.setLatitude(dto.getLatitude());
        pref.setLongitude(dto.getLongitude());
        pref.setRadiusKm(dto.getRadiusKm() != null ? dto.getRadiusKm() : 10.0);
        pref.setCategory(dto.getCategory());
        pref.setEnabled(dto.getEnabled() != null ? dto.getEnabled() : true);

        pref = preferenceRepository.save(pref);
        return toDto(pref);
    }

    public LocationPreferenceDto getPreference(Long userId) {
        return preferenceRepository.findByUserIdAndEnabledTrue(userId)
                .map(this::toDto)
                .orElse(null);
    }

    private LocationPreferenceDto toDto(UserLocationPreference p) {
        LocationPreferenceDto dto = new LocationPreferenceDto();
        dto.setId(p.getId());
        dto.setUserId(p.getUser().getId());
        dto.setLatitude(p.getLatitude());
        dto.setLongitude(p.getLongitude());
        dto.setRadiusKm(p.getRadiusKm());
        dto.setCategory(p.getCategory());
        dto.setEnabled(p.getEnabled());
        return dto;
    }
}
