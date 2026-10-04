package com.findback.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alert_preferences", indexes = {
    @Index(name = "idx_alert_pref_user", columnList = "user_id", unique = true),
    @Index(name = "idx_alert_pref_enabled", columnList = "enabled")
})
public class AlertPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String categories; // Comma-separated or JSON list of categories

    @Column(columnDefinition = "TEXT")
    private String locations; // Comma-separated list of campus locations

    @Column(name = "email_alerts", nullable = false)
    private Boolean emailAlerts = true;

    @Column(name = "push_alerts", nullable = false)
    private Boolean pushAlerts = true;

    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public AlertPreference() {}

    public AlertPreference(User user, String categories, String locations) {
        this.user = user;
        this.categories = categories;
        this.locations = locations;
        this.emailAlerts = true;
        this.pushAlerts = true;
        this.enabled = true;
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getCategories() { return categories; }
    public void setCategories(String categories) { this.categories = categories; }

    public String getLocations() { return locations; }
    public void setLocations(String locations) { this.locations = locations; }

    public Boolean getEmailAlerts() { return emailAlerts; }
    public void setEmailAlerts(Boolean emailAlerts) { this.emailAlerts = emailAlerts; }

    public Boolean getPushAlerts() { return pushAlerts; }
    public void setPushAlerts(Boolean pushAlerts) { this.pushAlerts = pushAlerts; }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
