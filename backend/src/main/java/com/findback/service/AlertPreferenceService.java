package com.findback.service;

import com.findback.dto.AlertPreferenceDto;
import com.findback.model.AlertPreference;
import com.findback.model.Item;
import com.findback.model.NotificationType;
import com.findback.model.User;
import com.findback.repository.AlertPreferenceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AlertPreferenceService {

    private static final Logger logger = LoggerFactory.getLogger(AlertPreferenceService.class);

    @Autowired
    private AlertPreferenceRepository alertPreferenceRepository;

    @Autowired
    private NotificationService notificationService;

    public AlertPreferenceDto getPreferences(User user) {
        AlertPreference pref = alertPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    AlertPreference defaultPref = new AlertPreference(user, "", "");
                    return alertPreferenceRepository.save(defaultPref);
                });
        return toDto(pref);
    }

    @Transactional
    public AlertPreferenceDto updatePreferences(AlertPreferenceDto dto, User user) {
        AlertPreference pref = alertPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> new AlertPreference(user, "", ""));

        String catStr = dto.getCategories() != null ? String.join(",", dto.getCategories()) : "";
        String locStr = dto.getLocations() != null ? String.join(",", dto.getLocations()) : "";

        pref.setCategories(catStr);
        pref.setLocations(locStr);
        pref.setEmailAlerts(dto.getEmailAlerts() != null ? dto.getEmailAlerts() : true);
        pref.setPushAlerts(dto.getPushAlerts() != null ? dto.getPushAlerts() : true);
        pref.setEnabled(dto.getEnabled() != null ? dto.getEnabled() : true);

        pref = alertPreferenceRepository.save(pref);
        return toDto(pref);
    }

    public void checkAndDispatchAlerts(Item item) {
        List<AlertPreference> allActive = alertPreferenceRepository.findByEnabledTrue();

        for (AlertPreference pref : allActive) {
            // Do not notify the student who submitted the report
            if (pref.getUser().getId().equals(item.getUser().getId())) {
                continue;
            }

            boolean categoryMatches = matchesList(pref.getCategories(), item.getCategory());
            boolean locationMatches = matchesList(pref.getLocations(), item.getLocation());

            if (categoryMatches || locationMatches) {
                String title = String.format("Campus Alert: %s %s", item.getType(), item.getCategory());
                String message = String.format("A %s '%s' was just reported at %s matching your alert preferences.",
                        item.getType().toString().toLowerCase(), item.getTitle(), item.getLocation());

                notificationService.createAndSend(
                        pref.getUser(),
                        title,
                        message,
                        NotificationType.SYSTEM,
                        "/items/" + item.getId()
                );
            }
        }
    }

    private boolean matchesList(String csv, String target) {
        if (csv == null || csv.isBlank() || target == null) return false;
        String[] items = csv.split(",");
        for (String item : items) {
            if (item.trim().equalsIgnoreCase(target.trim())) {
                return true;
            }
        }
        return false;
    }

    private AlertPreferenceDto toDto(AlertPreference pref) {
        List<String> categories = (pref.getCategories() != null && !pref.getCategories().isBlank())
                ? Arrays.stream(pref.getCategories().split(",")).map(String::trim).collect(Collectors.toList())
                : new ArrayList<>();

        List<String> locations = (pref.getLocations() != null && !pref.getLocations().isBlank())
                ? Arrays.stream(pref.getLocations().split(",")).map(String::trim).collect(Collectors.toList())
                : new ArrayList<>();

        return new AlertPreferenceDto(
                categories,
                locations,
                pref.getEmailAlerts(),
                pref.getPushAlerts(),
                pref.getEnabled()
        );
    }
}
