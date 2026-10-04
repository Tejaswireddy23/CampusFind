package com.findback.controller;

import com.findback.dto.MatchResponse;
import com.findback.exception.ResourceNotFoundException;
import com.findback.exception.UnauthorizedException;
import com.findback.model.Match;
import com.findback.model.MatchStatus;
import com.findback.model.Role;
import com.findback.model.User;
import com.findback.repository.MatchRepository;
import com.findback.service.ItemService;
import com.findback.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ItemService itemService;

    @GetMapping
    public ResponseEntity<List<MatchResponse>> getUserMatches(
            @RequestParam(required = false) Boolean savedOnly,
            Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        List<Match> matches = matchRepository.findByUserId(user.getId());

        List<MatchResponse> list = matches.stream()
                .filter(m -> m.getStatus() != MatchStatus.DISMISSED)
                .filter(m -> savedOnly == null || !savedOnly || Boolean.TRUE.equals(m.getIsSaved()))
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatchResponse> getMatchById(@PathVariable Long id, Authentication authentication) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));
        return ResponseEntity.ok(toResponse(match));
    }

    @PutMapping("/{id}/dismiss")
    public ResponseEntity<Map<String, String>> dismissMatch(@PathVariable Long id, Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        boolean isInvolved = match.getLostItem().getUser().getId().equals(user.getId())
                || match.getFoundItem().getUser().getId().equals(user.getId());
        if (!isInvolved && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Not authorized to dismiss this match");
        }

        match.setStatus(MatchStatus.DISMISSED);
        matchRepository.save(match);

        return ResponseEntity.ok(Collections.singletonMap("message", "Match dismissed"));
    }

    @PutMapping("/{id}/save")
    public ResponseEntity<MatchResponse> toggleSaveMatch(@PathVariable Long id, Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        boolean isInvolved = match.getLostItem().getUser().getId().equals(user.getId())
                || match.getFoundItem().getUser().getId().equals(user.getId());
        if (!isInvolved && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Not authorized to update this match");
        }

        match.setIsSaved(match.getIsSaved() == null || !match.getIsSaved());
        match = matchRepository.save(match);

        return ResponseEntity.ok(toResponse(match));
    }

    private MatchResponse toResponse(Match m) {
        MatchResponse res = new MatchResponse();
        res.setId(m.getId());
        res.setLostItem(itemService.toResponse(m.getLostItem()));
        res.setFoundItem(itemService.toResponse(m.getFoundItem()));
        res.setMatchScore(m.getMatchScore());
        res.setMatchReasons(m.getMatchReasons());
        res.setStatus(m.getStatus());
        res.setIsSaved(m.getIsSaved() != null ? m.getIsSaved() : false);
        res.setCreatedAt(m.getCreatedAt());

        // Parse matching & non-matching attributes
        List<String> matching = new ArrayList<>();
        List<String> nonMatching = new ArrayList<>();

        if (m.getMatchReasons() != null) {
            if (m.getMatchReasons().contains("||")) {
                String[] parts = m.getMatchReasons().split("\\|\\|");
                if (parts.length > 0 && !parts[0].isBlank()) {
                    for (String s : parts[0].split(";")) {
                        if (!s.isBlank()) matching.add(s.trim());
                    }
                }
                if (parts.length > 1 && !parts[1].isBlank()) {
                    for (String s : parts[1].split(";")) {
                        if (!s.isBlank()) nonMatching.add(s.trim());
                    }
                }
            } else {
                for (String s : m.getMatchReasons().split(";")) {
                    if (!s.isBlank()) {
                        if (s.contains("✓")) matching.add(s.trim());
                        else if (s.contains("✕")) nonMatching.add(s.trim());
                        else matching.add("✓ " + s.trim());
                    }
                }
            }
        }

        res.setMatchingAttributes(matching);
        res.setNonMatchingAttributes(nonMatching);
        return res;
    }
}
