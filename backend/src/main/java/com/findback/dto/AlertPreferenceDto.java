package com.findback.dto;

import java.util.ArrayList;
import java.util.List;

public class AlertPreferenceDto {
    private List<String> categories = new ArrayList<>();
    private List<String> locations = new ArrayList<>();
    private Boolean emailAlerts = true;
    private Boolean pushAlerts = true;
    private Boolean enabled = true;

    public AlertPreferenceDto() {}

    public AlertPreferenceDto(List<String> categories, List<String> locations, Boolean emailAlerts, Boolean pushAlerts, Boolean enabled) {
        this.categories = categories != null ? categories : new ArrayList<>();
        this.locations = locations != null ? locations : new ArrayList<>();
        this.emailAlerts = emailAlerts != null ? emailAlerts : true;
        this.pushAlerts = pushAlerts != null ? pushAlerts : true;
        this.enabled = enabled != null ? enabled : true;
    }

    public List<String> getCategories() { return categories; }
    public void setCategories(List<String> categories) { this.categories = categories; }

    public List<String> getLocations() { return locations; }
    public void setLocations(List<String> locations) { this.locations = locations; }

    public Boolean getEmailAlerts() { return emailAlerts; }
    public void setEmailAlerts(Boolean emailAlerts) { this.emailAlerts = emailAlerts; }

    public Boolean getPushAlerts() { return pushAlerts; }
    public void setPushAlerts(Boolean pushAlerts) { this.pushAlerts = pushAlerts; }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
}
