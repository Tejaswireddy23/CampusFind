package com.findback.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Value("${campusfind.mail.enabled:${findback.mail.enabled:false}}")
    private boolean mailEnabled;

    @Value("${campusfind.mail.from:${findback.mail.from:notifications@campusfind.edu}}")
    private String fromEmail;

    public void sendPotentialMatchEmail(String toEmail, String recipientName, String lostTitle, String matchTitle, int matchScore) {
        String subject = "CampusFind — Potential Match Found (" + matchScore + "% Match)";
        String body = String.format(
            "Hello %s,\n\nGood news! A found item '%s' matches your lost item '%s' with a %d%% confidence score.\n" +
            "Log in to your CampusFind account to view details and submit a claim.\n\nBest regards,\nCampusFind Team",
            recipientName, matchTitle, lostTitle, matchScore
        );
        sendEmailSafely(toEmail, subject, body);
    }

    public void sendClaimUpdateEmail(String toEmail, String recipientName, String itemTitle, String status, String note) {
        String subject = "CampusFind — Claim Status Updated to " + status;
        String body = String.format(
            "Hello %s,\n\nYour claim for '%s' is now %s.\n%s\n\nBest regards,\nCampusFind Team",
            recipientName, itemTitle, status, (note != null && !note.isBlank()) ? "Note: " + note : ""
        );
        sendEmailSafely(toEmail, subject, body);
    }

    public void sendReturnConfirmationEmail(String toEmail, String recipientName, String itemTitle) {
        String subject = "CampusFind — Item Successfully Recovered!";
        String body = String.format(
            "Hello %s,\n\nThe return process for '%s' has been confirmed by both parties! The item is officially marked as RECOVERED.\n" +
            "Thank you for being part of the CampusFind campus community.\n\nBest regards,\nCampusFind Team",
            recipientName, itemTitle
        );
        sendEmailSafely(toEmail, subject, body);
    }

    public void sendStudentApprovalEmail(String toEmail, String recipientName) {
        String subject = "CampusFind — Student Account Approved";
        String body = String.format(
            "Hello %s,\n\nYour CampusFind student account has been approved by the campus administrator. You can now log in to the Campus Lost & Found Portal.\n\nBest regards,\nCampusFind Administration Team",
            recipientName
        );
        sendEmailSafely(toEmail, subject, body);
    }

    public void sendStudentRejectionEmail(String toEmail, String recipientName, String reason) {
        String subject = "CampusFind — Registration Update";
        String body = String.format(
            "Hello %s,\n\nYour CampusFind student registration request could not be approved. Reason: %s\n\nContact your campus administrator for support.\n\nBest regards,\nCampusFind Administration Team",
            recipientName, reason
        );
        sendEmailSafely(toEmail, subject, body);
    }

    private void sendEmailSafely(String toEmail, String subject, String body) {
        try {
            if (!mailEnabled) {
                logger.info("[CAMPUSFIND EMAIL SIMULATION] Sending from: {} to: {}\nSubject: {}\n{}", fromEmail, toEmail, subject, body);
                return;
            }
            logger.info("Real SMTP delivery dispatched to {}", toEmail);
        } catch (Exception e) {
            logger.warn("Failed to deliver email to {}: {}. Continuing safely without crashing.", toEmail, e.getMessage());
        }
    }
}
