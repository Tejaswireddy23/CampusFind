package com.findback.service;

import com.findback.dto.ReportRequest;
import com.findback.dto.ReportResponse;
import com.findback.exception.ResourceNotFoundException;
import com.findback.model.*;
import com.findback.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private AuditService auditService;

    @Transactional
    public ReportResponse submitReport(ReportRequest request, User reporter) {
        Report report = new Report();
        report.setReporter(reporter);
        report.setReason(request.getReason());
        report.setDescription(request.getDescription());
        report.setStatus("PENDING");

        if (request.getReportedUserId() != null) {
            userRepository.findById(request.getReportedUserId()).ifPresent(report::setReportedUser);
        }

        if (request.getItemId() != null) {
            itemRepository.findById(request.getItemId()).ifPresent(report::setItem);
        }

        report = reportRepository.save(report);

        auditService.log(reporter.getId(), "REPORT_SUBMITTED", "REPORT", report.getId(),
                "Reported: " + request.getReason(), null);

        return toResponse(report);
    }

    public Page<ReportResponse> getAllReports(Pageable pageable) {
        return reportRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toResponse);
    }

    @Transactional
    public ReportResponse updateReportStatus(Long reportId, String status, User admin) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        report.setStatus(status.toUpperCase());
        report = reportRepository.save(report);

        auditService.log(admin.getId(), "REPORT_STATUS_UPDATED", "REPORT", report.getId(),
                "Updated report status to " + status, null);

        return toResponse(report);
    }

    private ReportResponse toResponse(Report r) {
        ReportResponse res = new ReportResponse();
        res.setId(r.getId());
        res.setReporterId(r.getReporter().getId());
        res.setReporterName(r.getReporter().getName());
        if (r.getReportedUser() != null) {
            res.setReportedUserId(r.getReportedUser().getId());
            res.setReportedUserName(r.getReportedUser().getName());
        }
        if (r.getItem() != null) {
            res.setItemId(r.getItem().getId());
            res.setItemTitle(r.getItem().getTitle());
        }
        res.setReason(r.getReason());
        res.setDescription(r.getDescription());
        res.setStatus(r.getStatus());
        res.setCreatedAt(r.getCreatedAt());
        return res;
    }
}
