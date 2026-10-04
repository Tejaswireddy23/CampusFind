package com.findback.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class CampusAlertDto {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    private String category = "General";
    private String targetAudience = "ALL STUDENTS";
    private String department;
    private String year;
    private String section;
    private String priority = "NORMAL";
    private String createdBy;
    private LocalDateTime createdAt;
    private int targetedUsersCount;

    public CampusAlertDto() {}

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

    public int getTargetedUsersCount() { return targetedUsersCount; }
    public void setTargetedUsersCount(int targetedUsersCount) { this.targetedUsersCount = targetedUsersCount; }
}
