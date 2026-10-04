package com.findback.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "campus_alerts")
public class CampusAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(length = 50)
    private String category = "General"; // Lost Item, Found Item, General, Emergency, Location Alert

    @Column(name = "target_audience", nullable = false, length = 50)
    private String targetAudience = "ALL STUDENTS"; // ALL STUDENTS, SPECIFIC DEPARTMENT, SPECIFIC YEAR, SPECIFIC SECTION, STUDENTS WITH RELEVANT REPORTS

    @Column(length = 100)
    private String department;

    @Column(name = "student_year", length = 30)
    private String year;

    @Column(length = 20)
    private String section;

    @Column(nullable = false, length = 20)
    private String priority = "NORMAL"; // NORMAL, IMPORTANT, URGENT

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public CampusAlert() {}

    public CampusAlert(String title, String message, String category, String targetAudience,
                       String department, String year, String section, String priority, String createdBy) {
        this.title = title;
        this.message = message;
        this.category = category != null ? category : "General";
        this.targetAudience = targetAudience != null ? targetAudience : "ALL STUDENTS";
        this.department = department;
        this.year = year;
        this.section = section;
        this.priority = priority != null ? priority : "NORMAL";
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.priority == null) this.priority = "NORMAL";
        if (this.targetAudience == null) this.targetAudience = "ALL STUDENTS";
        if (this.category == null) this.category = "General";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTargetAudience() { return targetAudience; }
    public void setTargetAudience(String targetAudience) { this.targetAudience = targetAudience; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
