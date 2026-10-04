package com.findback.dto;

public class CampusLocationDto {
    private Long id;
    private String name;
    private String code;
    private String zone;
    private String description;
    private Boolean active = true;

    public CampusLocationDto() {}

    public CampusLocationDto(Long id, String name, String code, String zone, String description) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.zone = zone;
        this.description = description;
        this.active = true;
    }

    public CampusLocationDto(Long id, String name, String code, String zone, String description, Boolean active) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.zone = zone;
        this.description = description;
        this.active = active != null ? active : true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getActive() { return active != null ? active : true; }
    public void setActive(Boolean active) { this.active = active; }
}
