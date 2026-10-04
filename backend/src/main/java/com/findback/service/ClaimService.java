package com.findback.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.findback.dto.*;
import com.findback.exception.BadRequestException;
import com.findback.exception.ResourceNotFoundException;
import com.findback.exception.UnauthorizedException;
import com.findback.model.*;
import com.findback.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClaimService {

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private ItemReturnRepository itemReturnRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuditService auditService;

    @Autowired
    private ItemService itemService;

    @Autowired
    private UserService userService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public ClaimResponse createClaim(ClaimRequest request, User claimant) {
        Item item = itemRepository.findById(request.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        if (item.getUser().getId().equals(claimant.getId())) {
            throw new BadRequestException("You cannot claim an item you reported yourself.");
        }

        Match match = null;
        if (request.getMatchId() != null) {
            match = matchRepository.findById(request.getMatchId()).orElse(null);
        }

        Claim claim = new Claim();
        claim.setItem(item);
        claim.setClaimant(claimant);
        claim.setMatch(match);
        claim.setStatus(ClaimStatus.PENDING);
        claim.setAdditionalNotes(request.getAdditionalNotes());

        try {
            if (request.getVerificationAnswers() != null) {
                claim.setVerificationAnswers(objectMapper.writeValueAsString(request.getVerificationAnswers()));
            }
        } catch (Exception e) {
            claim.setVerificationAnswers(request.getVerificationAnswers() != null ? request.getVerificationAnswers().toString() : "");
        }

        claim = claimRepository.save(claim);

        // Update item status to CLAIM_PENDING
        item.setStatus(ItemStatus.CLAIM_PENDING);
        itemRepository.save(item);

        auditService.log(claimant.getId(), "CLAIM_SUBMITTED", "CLAIM", claim.getId(),
                "Submitted claim for item: " + item.getTitle(), null);

        // Notify finder/item reporter
        String msg = claimant.getName() + " submitted a claim for '" + item.getTitle() + "'. Please review the ownership verification details.";
        notificationService.createAndSend(
                item.getUser(),
                "CampusFind — New Claim Submitted",
                msg,
                NotificationType.CLAIM_SUBMITTED,
                "/claims"
        );

        emailService.sendClaimUpdateEmail(item.getUser().getEmail(), item.getUser().getName(), item.getTitle(), "PENDING REVIEW", "A user submitted a claim on your listing.");

        return toResponse(claim, claimant);
    }

    public List<ClaimResponse> getUserClaims(User currentUser) {
        List<Claim> claims = claimRepository.findUserInvolvedClaims(currentUser.getId());
        return claims.stream().map(c -> toResponse(c, currentUser)).collect(Collectors.toList());
    }

    public ClaimResponse getClaimById(Long claimId, User currentUser) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

        boolean isClaimant = claim.getClaimant().getId().equals(currentUser.getId());
        boolean isItemOwner = claim.getItem().getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if (!isClaimant && !isItemOwner && !isAdmin) {
            throw new UnauthorizedException("You are not authorized to view this claim");
        }

        return toResponse(claim, currentUser);
    }

    @Transactional
    public ClaimResponse reviewClaim(Long claimId, ClaimReviewRequest request, User reviewer) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

        boolean isItemOwner = claim.getItem().getUser().getId().equals(reviewer.getId());
        boolean isAdmin = reviewer.getRole() == Role.ADMIN;

        if (!isItemOwner && !isAdmin) {
            throw new UnauthorizedException("Only the finder or an admin can review this claim");
        }

        String action = request.getAction().toUpperCase();
        if ("APPROVE".equals(action)) {
            claim.setStatus(ClaimStatus.APPROVED);
            claim.getItem().setStatus(ItemStatus.VERIFICATION_PENDING);
            itemRepository.save(claim.getItem());

            notificationService.createAndSend(
                    claim.getClaimant(),
                    "CampusFind — Claim Approved!",
                    "Your claim for '" + claim.getItem().getTitle() + "' was approved! Please coordinate return and confirm handover.",
                    NotificationType.CLAIM_APPROVED,
                    "/claims"
            );
            emailService.sendClaimUpdateEmail(claim.getClaimant().getEmail(), claim.getClaimant().getName(), claim.getItem().getTitle(), "APPROVED", request.getNotes());

        } else if ("REJECT".equals(action)) {
            claim.setStatus(ClaimStatus.REJECTED);
            claim.getItem().setStatus(ItemStatus.ACTIVE);
            itemRepository.save(claim.getItem());

            notificationService.createAndSend(
                    claim.getClaimant(),
                    "CampusFind — Claim Rejected",
                    "Your claim for '" + claim.getItem().getTitle() + "' was rejected. Reason: " + request.getNotes(),
                    NotificationType.CLAIM_REJECTED,
                    "/claims"
            );
            emailService.sendClaimUpdateEmail(claim.getClaimant().getEmail(), claim.getClaimant().getName(), claim.getItem().getTitle(), "REJECTED", request.getNotes());

        } else if ("REQUEST_INFO".equals(action) || "UNDER_REVIEW".equals(action)) {
            claim.setStatus(ClaimStatus.UNDER_REVIEW);
            notificationService.createAndSend(
                    claim.getClaimant(),
                    "CampusFind — More Information Requested",
                    "The finder/admin requested more details for your claim on '" + claim.getItem().getTitle() + "'. Note: " + request.getNotes(),
                    NotificationType.INFO_REQUESTED,
                    "/claims"
            );
        } else {
            throw new BadRequestException("Invalid action: " + action);
        }

        if (request.getNotes() != null) {
            claim.setAdminNotes(request.getNotes());
        }

        claim = claimRepository.save(claim);
        auditService.log(reviewer.getId(), "CLAIM_" + action, "CLAIM", claim.getId(),
                "Claim reviewed with action " + action, null);

        return toResponse(claim, reviewer);
    }

    @Transactional
    public ReturnResponse confirmReturn(Long claimId, ReturnConfirmRequest request, User currentUser) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

        if (claim.getStatus() != ClaimStatus.APPROVED && claim.getStatus() != ClaimStatus.RETURNED) {
            throw new BadRequestException("Claim must be APPROVED before confirming return.");
        }

        Item item = claim.getItem();
        User claimant = claim.getClaimant();
        User finder = item.getUser();

        boolean isFinder = finder.getId().equals(currentUser.getId());
        boolean isOwner = claimant.getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if (!isFinder && !isOwner && !isAdmin) {
            throw new UnauthorizedException("You are not part of this return process.");
        }

        String type = request.getConfirmationType().toUpperCase();
        if ("HANDOVER".equals(type) || isFinder) {
            claim.setFinderConfirmedHandover(true);
            auditService.log(currentUser.getId(), "RETURN_HANDOVER_CONFIRMED", "CLAIM", claim.getId(), "Finder confirmed handover", null);
        }
        if ("RECEIPT".equals(type) || isOwner) {
            claim.setOwnerConfirmedReceipt(true);
            auditService.log(currentUser.getId(), "RETURN_RECEIPT_CONFIRMED", "CLAIM", claim.getId(), "Owner confirmed receipt", null);
        }

        // If admin confirms, mark both confirmed
        if (isAdmin) {
            claim.setFinderConfirmedHandover(true);
            claim.setOwnerConfirmedReceipt(true);
        }

        ItemReturn itemReturn = null;

        // When both parties have confirmed:
        if (Boolean.TRUE.equals(claim.getFinderConfirmedHandover()) && Boolean.TRUE.equals(claim.getOwnerConfirmedReceipt())) {
            claim.setStatus(ClaimStatus.RETURNED);

            // Update item statuses to RECOVERED (Requirement 28)
            item.setStatus(ItemStatus.RECOVERED);
            itemRepository.save(item);

            // If linked to a match, close the match and update linked lost item to RECOVERED
            if (claim.getMatch() != null) {
                Match match = claim.getMatch();
                match.setStatus(MatchStatus.CLOSED);
                matchRepository.save(match);

                if (match.getLostItem() != null) {
                    match.getLostItem().setStatus(ItemStatus.RECOVERED);
                    itemRepository.save(match.getLostItem());
                }
            }

            // Create return record
            itemReturn = new ItemReturn();
            itemReturn.setClaim(claim);
            itemReturn.setLostItem(claim.getMatch() != null ? claim.getMatch().getLostItem() : item);
            itemReturn.setFoundItem(item.getType() == ItemType.FOUND ? item : null);
            itemReturn.setOwner(claimant);
            itemReturn.setFinder(finder);
            itemReturn.setReturnDate(LocalDateTime.now());
            itemReturn.setHandoverNotes(request.getNotes() != null ? request.getNotes() : "Confirmed return by both parties.");
            itemReturn.setStatus("COMPLETED");
            itemReturn = itemReturnRepository.save(itemReturn);

            auditService.log(currentUser.getId(), "ITEM_RETURNED", "RETURN", itemReturn.getId(),
                    "Item officially returned: " + item.getTitle(), null);

            // Real-time notification to BOTH users
            notificationService.createAndSend(
                    claimant,
                    "CampusFind — Item Return Completed!",
                    "Your return confirmation for '" + item.getTitle() + "' is complete. Item marked RECOVERED!",
                    NotificationType.RETURNED,
                    "/claims"
            );

            notificationService.createAndSend(
                    finder,
                    "CampusFind — Item Return Completed!",
                    "The handover for '" + item.getTitle() + "' is complete. Thank you for helping return it!",
                    NotificationType.RETURNED,
                    "/claims"
            );

            emailService.sendReturnConfirmationEmail(claimant.getEmail(), claimant.getName(), item.getTitle());
            emailService.sendReturnConfirmationEmail(finder.getEmail(), finder.getName(), item.getTitle());
        }

        claimRepository.save(claim);

        ReturnResponse response = new ReturnResponse();
        response.setClaimId(claim.getId());
        response.setLostItemId(item.getId());
        response.setLostItemTitle(item.getTitle());
        response.setOwnerId(claimant.getId());
        response.setOwnerName(claimant.getName());
        response.setFinderId(finder.getId());
        response.setFinderName(finder.getName());
        response.setStatus(claim.getStatus().name());
        response.setReturnDate(LocalDateTime.now());
        response.setHandoverNotes(claim.getFinderConfirmedHandover() && claim.getOwnerConfirmedReceipt()
                ? "Fully confirmed by both parties"
                : (claim.getFinderConfirmedHandover() ? "Handover confirmed by Finder. Awaiting Owner receipt." : "Receipt confirmed by Owner. Awaiting Finder handover."));

        if (itemReturn != null) {
            response.setId(itemReturn.getId());
        }
        return response;
    }

    public ClaimResponse toResponse(Claim claim, User viewingUser) {
        ClaimResponse res = new ClaimResponse();
        res.setId(claim.getId());
        res.setItem(itemService.toResponse(claim.getItem()));
        res.setClaimant(userService.toUserDto(claim.getClaimant()));
        res.setMatchId(claim.getMatch() != null ? claim.getMatch().getId() : null);
        res.setStatus(claim.getStatus());
        res.setAdditionalNotes(claim.getAdditionalNotes());
        res.setAdminNotes(claim.getAdminNotes());
        res.setFinderConfirmedHandover(claim.getFinderConfirmedHandover());
        res.setOwnerConfirmedReceipt(claim.getOwnerConfirmedReceipt());
        res.setCreatedAt(claim.getCreatedAt());
        res.setUpdatedAt(claim.getUpdatedAt());

        // Private verification information is ONLY shown to claimant, finder, or admin
        boolean isAuthorized = viewingUser != null && (
                viewingUser.getRole() == Role.ADMIN ||
                viewingUser.getId().equals(claim.getClaimant().getId()) ||
                viewingUser.getId().equals(claim.getItem().getUser().getId())
        );

        if (isAuthorized) {
            res.setVerificationAnswers(claim.getVerificationAnswers());
        } else {
            res.setVerificationAnswers(null); // Never publicly exposed
        }

        return res;
    }
}
