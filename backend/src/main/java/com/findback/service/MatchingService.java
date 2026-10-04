package com.findback.service;

import com.findback.dto.MatchExplanationDto;
import com.findback.model.*;
import com.findback.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class MatchingService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserLocationPreferenceRepository locationPreferenceRepository;

    @Autowired
    private CampusLocationRepository campusLocationRepository;

    @Autowired
    private AlertPreferenceService alertPreferenceService;

    // Configurable weights (Total = 100)
    @Value("${campusfind.matching.weight.category:${findback.matching.weight.category:25}}")
    private int weightCategory;

    @Value("${campusfind.matching.weight.brand:${findback.matching.weight.brand:15}}")
    private int weightBrand;

    @Value("${campusfind.matching.weight.model:${findback.matching.weight.model:15}}")
    private int weightModel;

    @Value("${campusfind.matching.weight.color:${findback.matching.weight.color:10}}")
    private int weightColor;

    @Value("${campusfind.matching.weight.location:${findback.matching.weight.location:15}}")
    private int weightLocation;

    @Value("${campusfind.matching.weight.date:${findback.matching.weight.date:10}}")
    private int weightDate;

    @Value("${campusfind.matching.weight.description:${findback.matching.weight.description:10}}")
    private int weightDescription;

    @Transactional
    public void checkForMatches(Item newItem) {
        // Only compare opposite item types
        ItemType targetType = newItem.getType() == ItemType.LOST ? ItemType.FOUND : ItemType.LOST;
        List<Item> candidates = itemRepository.findCandidatesForMatching(targetType, newItem.getCategory());

        for (Item candidate : candidates) {
            // Cannot match item with own report
            if (candidate.getUser().getId().equals(newItem.getUser().getId())) {
                continue;
            }

            Item lostItem = newItem.getType() == ItemType.LOST ? newItem : candidate;
            Item foundItem = newItem.getType() == ItemType.FOUND ? newItem : candidate;

            if (matchRepository.existsByLostItemIdAndFoundItemId(lostItem.getId(), foundItem.getId())) {
                continue;
            }

            MatchResult result = calculateMatchScore(lostItem, foundItem);
            // Threshold for creating potential match
            if (result.score >= 50) {
                String serializedReasons = String.join(";", result.explanation.getMatchingAttributes())
                        + "||" + String.join(";", result.explanation.getNonMatchingAttributes());

                Match match = new Match(lostItem, foundItem, result.score, serializedReasons);
                match = matchRepository.save(match);

                // Live Campus Alert: Send notification to the student who reported lost item
                String lostAlertMsg = String.format("A found item similar to your lost %s was reported at the %s.",
                        lostItem.getTitle(), foundItem.getLocation());

                notificationService.createAndSend(
                        lostItem.getUser(),
                        "CampusFind — Potential Match Found",
                        lostAlertMsg,
                        NotificationType.MATCH,
                        "/matches/" + match.getId()
                );

                // Also notify the student who found the item
                String foundAlertMsg = String.format("A lost report matching the item you found '%s' was reported at the %s.",
                        foundItem.getTitle(), lostItem.getLocation());

                notificationService.createAndSend(
                        foundItem.getUser(),
                        "CampusFind — Potential Match Found",
                        foundAlertMsg,
                        NotificationType.MATCH,
                        "/matches/" + match.getId()
                );

                // Dispatch Email abstraction safely
                emailService.sendPotentialMatchEmail(
                        lostItem.getUser().getEmail(),
                        lostItem.getUser().getName(),
                        lostItem.getTitle(),
                        foundItem.getTitle(),
                        result.score
                );
            }
        }

        // Targeted Campus Alert Preferences notification
        try {
            alertPreferenceService.checkAndDispatchAlerts(newItem);
        } catch (Exception e) {
            // Non-critical
        }

        // Geofenced alerts check if coordinates present
        checkGeofencedAlerts(newItem);
    }

    private void checkGeofencedAlerts(Item item) {
        if (item.getLatitude() == null || item.getLongitude() == null) return;

        List<UserLocationPreference> prefs = locationPreferenceRepository.findByEnabledTrue();
        for (UserLocationPreference pref : prefs) {
            // Skip item author
            if (pref.getUser().getId().equals(item.getUser().getId())) continue;

            // Optional category filter
            if (pref.getCategory() != null && !pref.getCategory().equalsIgnoreCase("All Categories")
                    && !pref.getCategory().equalsIgnoreCase(item.getCategory())) {
                continue;
            }

            double dist = calculateDistanceKm(pref.getLatitude(), pref.getLongitude(), item.getLatitude(), item.getLongitude());
            if (dist <= pref.getRadiusKm()) {
                notificationService.createAndSend(
                        pref.getUser(),
                        "Geofenced Item Alert",
                        String.format("A %s item '%s' was reported within %.1f km of your watched zone (%s).",
                                item.getType(), item.getTitle(), dist, item.getLocation()),
                        NotificationType.GEOFENCE_ALERT,
                        "/items/" + item.getId()
                );
            }
        }
    }

    public MatchResult calculateMatchScore(Item lost, Item found) {
        int score = 0;
        List<String> matching = new ArrayList<>();
        List<String> nonMatching = new ArrayList<>();

        // 1. Category (Weight: 25%)
        if (lost.getCategory() != null && lost.getCategory().equalsIgnoreCase(found.getCategory())) {
            score += weightCategory;
            matching.add("✓ Same category: " + lost.getCategory());
        } else {
            nonMatching.add("✕ Different category");
        }

        // 2. Brand (Weight: 15%)
        if (lost.getBrand() != null && found.getBrand() != null && !lost.getBrand().isBlank() && !found.getBrand().isBlank()) {
            if (lost.getBrand().trim().equalsIgnoreCase(found.getBrand().trim())) {
                score += weightBrand;
                matching.add("✓ Same brand: " + lost.getBrand());
            } else if (lost.getBrand().toLowerCase().contains(found.getBrand().toLowerCase()) ||
                       found.getBrand().toLowerCase().contains(lost.getBrand().toLowerCase())) {
                score += (int) (weightBrand * 0.7);
                matching.add("✓ Similar brand: " + lost.getBrand() + " / " + found.getBrand());
            } else {
                nonMatching.add("✕ Different brand: " + lost.getBrand() + " vs " + found.getBrand());
            }
        } else {
            // Partial credit if brand unspecified in one
            score += (int) (weightBrand * 0.4);
        }

        // 3. Model (Weight: 15%)
        if (lost.getModel() != null && found.getModel() != null && !lost.getModel().isBlank() && !found.getModel().isBlank()) {
            if (lost.getModel().trim().equalsIgnoreCase(found.getModel().trim())) {
                score += weightModel;
                matching.add("✓ Same model: " + lost.getModel());
            } else if (lost.getModel().toLowerCase().contains(found.getModel().toLowerCase()) ||
                       found.getModel().toLowerCase().contains(lost.getModel().toLowerCase())) {
                score += (int) (weightModel * 0.65);
                matching.add("✓ Similar model variant: " + lost.getModel());
            } else {
                nonMatching.add("✕ Different model");
            }
        } else {
            score += (int) (weightModel * 0.3);
        }

        // 4. Color (Weight: 10%)
        if (lost.getColor() != null && found.getColor() != null && !lost.getColor().isBlank() && !found.getColor().isBlank()) {
            if (lost.getColor().trim().equalsIgnoreCase(found.getColor().trim())) {
                score += weightColor;
                matching.add("✓ Same color: " + lost.getColor());
            } else if (lost.getColor().toLowerCase().contains(found.getColor().toLowerCase()) ||
                       found.getColor().toLowerCase().contains(lost.getColor().toLowerCase())) {
                score += (int) (weightColor * 0.6);
                matching.add("✓ Similar color hue");
            } else {
                nonMatching.add("✕ Different color: " + lost.getColor() + " vs " + found.getColor());
            }
        }

        // 5. Campus Location (Weight: 15%) - Campus-aware matching
        if (lost.getLocation() != null && found.getLocation() != null) {
            String l1 = lost.getLocation().trim();
            String l2 = found.getLocation().trim();

            if (l1.equalsIgnoreCase(l2)) {
                score += weightLocation;
                matching.add("✓ Same campus location: " + l1);
            } else if (isNearbyCampusLocation(l1, l2)) {
                score += (int) (weightLocation * 0.75);
                matching.add("✓ Nearby campus location: " + l1 + " & " + l2);
            } else if (l1.toLowerCase().contains(l2.toLowerCase()) || l2.toLowerCase().contains(l1.toLowerCase())) {
                score += (int) (weightLocation * 0.85);
                matching.add("✓ Similar campus location: " + l2);
            } else {
                nonMatching.add("✕ Different campus location: " + l1 + " vs " + l2);
            }
        }

        // 6. Date (Weight: 10%)
        if (lost.getDateLostOrFound() != null && found.getDateLostOrFound() != null) {
            long daysApart = Math.abs(ChronoUnit.DAYS.between(lost.getDateLostOrFound(), found.getDateLostOrFound()));
            if (daysApart == 0) {
                score += weightDate;
                matching.add("✓ Exact same date event (" + lost.getDateLostOrFound() + ")");
            } else if (daysApart <= 2) {
                score += (int) (weightDate * 0.8);
                matching.add("✓ Similar date (within 2 days)");
            } else if (daysApart <= 7) {
                score += (int) (weightDate * 0.5);
                matching.add("✓ Date within 1 week");
            } else {
                nonMatching.add("✕ Dates separated by " + daysApart + " days");
            }
        }

        // 7. Description & Title Keywords (Weight: 10%)
        if (lost.getDescription() != null && found.getDescription() != null) {
            int overlapCount = countCommonWords(lost.getTitle() + " " + lost.getDescription(),
                                               found.getTitle() + " " + found.getDescription());
            if (overlapCount >= 4) {
                score += weightDescription;
                matching.add("✓ High description keyword overlap");
            } else if (overlapCount >= 2) {
                score += (int) (weightDescription * 0.6);
                matching.add("✓ Similar descriptive terms");
            }
        }

        // Cap at 100
        int finalScore = Math.min(100, Math.max(0, score));
        MatchExplanationDto explanation = new MatchExplanationDto(finalScore, matching, nonMatching);
        return new MatchResult(finalScore, explanation);
    }

    public static double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10.0) / 10.0;
    }

    private boolean isNearbyCampusLocation(String loc1, String loc2) {
        if (loc1 == null || loc2 == null) return false;
        String l1 = loc1.trim().toLowerCase();
        String l2 = loc2.trim().toLowerCase();
        if (l1.equals(l2)) return true;

        if ((l1.contains("library") && l2.contains("academic block")) ||
            (l1.contains("academic block") && l2.contains("library"))) return true;
        if ((l1.contains("academic block") && l2.contains("computer block")) ||
            (l1.contains("computer block") && l2.contains("academic block"))) return true;
        if ((l1.contains("computer block") && l2.contains("laboratory")) ||
            (l1.contains("laboratory") && l2.contains("computer block"))) return true;
        if ((l1.contains("canteen") && l2.contains("seminar hall")) ||
            (l1.contains("seminar hall") && l2.contains("canteen"))) return true;
        if ((l1.contains("main gate") && l2.contains("bus area")) ||
            (l1.contains("bus area") && l2.contains("main gate"))) return true;
        if ((l1.contains("main gate") && l2.contains("parking area")) ||
            (l1.contains("parking area") && l2.contains("main gate"))) return true;
        if ((l1.contains("seminar hall") && l2.contains("auditorium")) ||
            (l1.contains("auditorium") && l2.contains("seminar hall"))) return true;
        if ((l1.contains("hostel") && l2.contains("playground")) ||
            (l1.contains("playground") && l2.contains("hostel"))) return true;

        try {
            CampusLocation cl1 = campusLocationRepository.findByNameIgnoreCase(loc1).orElse(null);
            CampusLocation cl2 = campusLocationRepository.findByNameIgnoreCase(loc2).orElse(null);
            if (cl1 != null && cl2 != null && cl1.getZone() != null && cl2.getZone() != null) {
                return cl1.getZone().equalsIgnoreCase(cl2.getZone());
            }
        } catch (Exception e) {}

        return false;
    }

    private int countCommonWords(String text1, String text2) {
        if (text1 == null || text2 == null) return 0;
        String[] w1 = text1.toLowerCase().split("[^a-zA-Z0-9]+");
        String t2 = text2.toLowerCase();
        int count = 0;
        for (String w : w1) {
            if (w.length() > 3 && t2.contains(w)) {
                count++;
            }
        }
        return count;
    }

    public static class MatchResult {
        public final int score;
        public final MatchExplanationDto explanation;

        public MatchResult(int score, MatchExplanationDto explanation) {
            this.score = score;
            this.explanation = explanation;
        }
    }
}
