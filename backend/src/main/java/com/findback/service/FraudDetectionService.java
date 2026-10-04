package com.findback.service;

import com.findback.dto.FraudAlertDto;
import com.findback.model.*;
import com.findback.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class FraudDetectionService {

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    public List<FraudAlertDto> detectSuspiciousActivities() {
        List<FraudAlertDto> alerts = new ArrayList<>();

        // 1. Multiple claims on one item (> 1 claim on an item)
        List<Item> allItems = itemRepository.findAll();
        for (Item item : allItems) {
            long claimCount = claimRepository.countByItemId(item.getId());
            if (claimCount > 1) {
                FraudAlertDto alert = new FraudAlertDto();
                alert.setId("FA-ITEM-" + item.getId());
                alert.setSeverity("HIGH");
                alert.setType("MULTIPLE_CLAIMS_ONE_ITEM");
                alert.setTitle("Multiple Claims on Single Item");
                alert.setReason("Item '" + item.getTitle() + "' has received " + claimCount + " competing claims.");
                alert.setEntityType("ITEM");
                alert.setEntityId(item.getId());
                alert.setCount(claimCount);
                alert.setDetectedAt(LocalDateTime.now());
                alerts.add(alert);
            }
        }

        // 2. Users with repeated rejected claims (> 1 rejected claim)
        List<User> users = userRepository.findAll();
        for (User u : users) {
            long rejectedClaims = claimRepository.countByClaimantIdAndStatus(u.getId(), ClaimStatus.REJECTED);
            if (rejectedClaims >= 1) {
                FraudAlertDto alert = new FraudAlertDto();
                alert.setId("FA-REJ-" + u.getId());
                alert.setSeverity(rejectedClaims > 2 ? "HIGH" : "MEDIUM");
                alert.setType("REPEATED_REJECTED_CLAIMS");
                alert.setTitle("Repeated Rejected Claims");
                alert.setReason("User " + u.getName() + " (" + u.getEmail() + ") has " + rejectedClaims + " rejected claim(s).");
                alert.setEntityType("USER");
                alert.setEntityId(u.getId());
                alert.setUserId(u.getId());
                alert.setUserName(u.getName());
                alert.setCount(rejectedClaims);
                alert.setDetectedAt(LocalDateTime.now());
                alerts.add(alert);
            }

            // 3. Excessive claims in total (> 3 claims by a single user)
            long totalClaims = claimRepository.countByClaimantId(u.getId());
            if (totalClaims >= 3) {
                FraudAlertDto alert = new FraudAlertDto();
                alert.setId("FA-EXCESS-" + u.getId());
                alert.setSeverity("MEDIUM");
                alert.setType("MULTIPLE_SUSPICIOUS_CLAIMS");
                alert.setTitle("High Claim Volume");
                alert.setReason("User " + u.getName() + " has filed " + totalClaims + " claims across different items.");
                alert.setEntityType("USER");
                alert.setEntityId(u.getId());
                alert.setUserId(u.getId());
                alert.setUserName(u.getName());
                alert.setCount(totalClaims);
                alert.setDetectedAt(LocalDateTime.now());
                alerts.add(alert);
            }

            // 4. Repeated reports against this user
            long reportsAgainstUser = reportRepository.countByReportedUserId(u.getId());
            if (reportsAgainstUser >= 1) {
                FraudAlertDto alert = new FraudAlertDto();
                alert.setId("FA-REP-" + u.getId());
                alert.setSeverity("HIGH");
                alert.setType("USER_FLAGGED_BY_COMMUNITY");
                alert.setTitle("Community Scam / Harassment Reports");
                alert.setReason("User has " + reportsAgainstUser + " report(s) submitted against them by other members.");
                alert.setEntityType("USER");
                alert.setEntityId(u.getId());
                alert.setUserId(u.getId());
                alert.setUserName(u.getName());
                alert.setCount(reportsAgainstUser);
                alert.setDetectedAt(LocalDateTime.now());
                alerts.add(alert);
            }
        }

        return alerts;
    }

    public long getSuspiciousActivityCount() {
        return detectSuspiciousActivities().size();
    }
}
