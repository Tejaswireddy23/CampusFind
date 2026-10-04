package com.findback.dto;

import jakarta.validation.constraints.NotNull;

public class LocationPreferenceDto {
    private Long id;
    private Long userId;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private Double radiusKm = 10.0;
    private String category;
    private Boolean enabled = true;

    public LocationPreferenceDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getRadiusKm() { return radiusKm; }
    public void setRadiusKm(Double radiusKm) { this.radiusKm = radiusKm; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPreferredCategory() { return category; }
    public void setPreferredCategory(String preferredCategory) { this.category = preferredCategory; }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }

    public Boolean getAlertEnabled() { return enabled; }
    public void setAlertEnabled(Boolean alertEnabled) { this.enabled = alertEnabled; }
}
