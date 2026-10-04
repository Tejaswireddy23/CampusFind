package com.findback.repository;

import com.findback.model.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByReporterId(Long reporterId);
    List<Report> findByReportedUserId(Long reportedUserId);
    List<Report> findByItemId(Long itemId);
    long countByStatus(String status);
    Page<Report> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByReportedUserId(Long reportedUserId);
}
