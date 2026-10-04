package com.findback.repository;

import com.findback.model.CampusAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampusAlertRepository extends JpaRepository<CampusAlert, Long> {

    Page<CampusAlert> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<CampusAlert> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT a FROM CampusAlert a WHERE " +
           "a.targetAudience = 'ALL STUDENTS' OR " +
           "(a.targetAudience = 'SPECIFIC DEPARTMENT' AND LOWER(a.department) = LOWER(:dept)) OR " +
           "(a.targetAudience = 'SPECIFIC YEAR' AND LOWER(a.year) = LOWER(:year)) OR " +
           "(a.targetAudience = 'SPECIFIC SECTION' AND LOWER(a.section) = LOWER(:section)) " +
           "ORDER BY a.createdAt DESC")
    Page<CampusAlert> findAlertsForStudent(
            @Param("dept") String dept,
            @Param("year") String year,
            @Param("section") String section,
            Pageable pageable);
}
