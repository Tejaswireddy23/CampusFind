package com.findback.dto;

import com.findback.model.ItemType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ItemRequest {
    private ItemType type;

    @NotBlank(message = "Item title is required")
    private String title;

    @NotBlank(message = "Category is required")
    private String category;

    private String brand;
    private String model;
    private String color;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Date is required")
    private LocalDate dateLostOrFound;

    private String approximateTime;

    @NotBlank(message = "Location is required")
    private String location;

    private Double latitude;
    private Double longitude;
    private String additionalDetails;
    private BigDecimal reward = BigDecimal.ZERO;
    private String imageUrl;

    public ItemRequest() {}

    public ItemType getType() { return type; }
    public void setType(ItemType type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDateLostOrFound() { return dateLostOrFound; }
    public void setDateLostOrFound(LocalDate dateLostOrFound) { this.dateLostOrFound = dateLostOrFound; }
    public void setDateLostFound(LocalDate dateLostFound) { this.dateLostOrFound = dateLostFound; }
    public void setPrimaryColor(String primaryColor) { this.color = primaryColor; }

    public String getApproximateTime() { return approximateTime; }
    public void setApproximateTime(String approximateTime) { this.approximateTime = approximateTime; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCampusLocation() { return location; }
    public void setCampusLocation(String campusLocation) {
        if (campusLocation != null && !campusLocation.isBlank()) {
            this.location = campusLocation;
        }
    }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getAdditionalDetails() { return additionalDetails; }
    public void setAdditionalDetails(String additionalDetails) { this.additionalDetails = additionalDetails; }

    public BigDecimal getReward() { return reward; }
    public void setReward(BigDecimal reward) { this.reward = reward; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
