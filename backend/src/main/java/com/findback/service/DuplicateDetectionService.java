package com.findback.service;

import com.findback.dto.DuplicateCheckRequest;
import com.findback.dto.DuplicateCheckResponse;
import com.findback.dto.ItemResponse;
import com.findback.model.Item;
import com.findback.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DuplicateDetectionService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private ItemService itemService;

    public DuplicateCheckResponse checkForDuplicates(DuplicateCheckRequest request) {
        // Search items of the SAME type and category
        List<Item> candidates = itemRepository.findCandidatesForMatching(request.getType(), request.getCategory());

        List<ItemResponse> similarList = new ArrayList<>();
        int highestScore = 0;

        for (Item candidate : candidates) {
            int score = calculateSimilarity(request, candidate);
            if (score >= 65) {
                similarList.add(itemService.toResponse(candidate));
                if (score > highestScore) {
                    highestScore = score;
                }
            }
        }

        boolean hasSimilar = !similarList.isEmpty();
        String reason = hasSimilar
                ? String.format("Similar campus report found. %d existing %s report(s) detected with %d%% similarity in category '%s'.",
                        similarList.size(), request.getType(), highestScore, request.getCategory())
                : "No similar reports detected. You are good to proceed.";

        return new DuplicateCheckResponse(hasSimilar, highestScore, reason, similarList);
    }

    private int calculateSimilarity(DuplicateCheckRequest req, Item existing) {
        int score = 0;

        // Same Student / User check (Requirement 26)
        if (req.getUserId() != null && existing.getUser() != null && req.getUserId().equals(existing.getUser().getId())) {
            score += 15;
        }

        // Title / Item Name similarity (25%)
        if (req.getTitle() != null && existing.getTitle() != null) {
            String t1 = req.getTitle().toLowerCase().trim();
            String t2 = existing.getTitle().toLowerCase().trim();
            if (t1.equals(t2)) {
                score += 25;
            } else if (t1.contains(t2) || t2.contains(t1)) {
                score += 15;
            }
        }

        // Brand & Model (20%)
        if (req.getBrand() != null && existing.getBrand() != null && !req.getBrand().isBlank()) {
            if (req.getBrand().trim().equalsIgnoreCase(existing.getBrand().trim())) {
                score += 12;
            }
        }
        if (req.getModel() != null && existing.getModel() != null && !req.getModel().isBlank()) {
            if (req.getModel().trim().equalsIgnoreCase(existing.getModel().trim())) {
                score += 8;
            }
        }

        // Color (10%)
        if (req.getColor() != null && existing.getColor() != null && !req.getColor().isBlank()) {
            if (req.getColor().trim().equalsIgnoreCase(existing.getColor().trim())) {
                score += 10;
            }
        }

        // Campus Location (15%)
        if (req.getLocation() != null && existing.getLocation() != null) {
            String l1 = req.getLocation().toLowerCase().trim();
            String l2 = existing.getLocation().toLowerCase().trim();
            if (l1.equals(l2) || l1.contains(l2) || l2.contains(l1)) {
                score += 15;
            }
        }

        // Description overlap (15%)
        if (req.getDescription() != null && existing.getDescription() != null) {
            String[] words = req.getDescription().toLowerCase().split("[^a-zA-Z0-9]+");
            String d2 = existing.getDescription().toLowerCase();
            int count = 0;
            for (String w : words) {
                if (w.length() > 3 && d2.contains(w)) count++;
            }
            if (count >= 4) score += 15;
            else if (count >= 2) score += 8;
        }

        // Date (10%)
        if (req.getDateLostOrFound() != null && existing.getDateLostOrFound() != null) {
            if (req.getDateLostOrFound().equals(existing.getDateLostOrFound())) {
                score += 10;
            }
        }

        return Math.min(100, score);
    }
}
