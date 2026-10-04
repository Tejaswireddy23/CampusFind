package com.findback.service;

import com.findback.dto.CampusLocationDto;
import com.findback.exception.BadRequestException;
import com.findback.exception.ResourceNotFoundException;
import com.findback.model.CampusLocation;
import com.findback.repository.CampusLocationRepository;
import com.findback.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CampusLocationService {

    @Autowired
    private CampusLocationRepository campusLocationRepository;

    public List<CampusLocationDto> getAllLocations() {
        return campusLocationRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<CampusLocationDto> getActiveLocations() {
        return campusLocationRepository.findAll().stream()
                .filter(loc -> Boolean.TRUE.equals(loc.getActive()))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CampusLocationDto createLocation(CampusLocationDto dto) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new BadRequestException("Location name is required");
        }
        if (campusLocationRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new BadRequestException("Location with this name already exists");
        }

        String code = dto.getCode();
        if (code == null || code.isBlank()) {
            code = dto.getName().trim().toUpperCase().replaceAll("[^A-Z0-9]", "");
            if (code.length() > 6) code = code.substring(0, 6);
        }

        CampusLocation loc = new CampusLocation(
                dto.getName().trim(),
                code,
                dto.getZone() != null ? dto.getZone().trim() : "General Zone",
                dto.getDescription() != null ? dto.getDescription().trim() : ""
        );
        loc.setActive(dto.getActive() != null ? dto.getActive() : true);
        loc = campusLocationRepository.save(loc);
        return toDto(loc);
    }

    @Transactional
    public CampusLocationDto updateLocation(Long id, CampusLocationDto dto) {
        CampusLocation loc = campusLocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campus location not found with id: " + id));

        if (dto.getName() != null && !dto.getName().isBlank()) {
            loc.setName(dto.getName().trim());
        }
        if (dto.getCode() != null && !dto.getCode().isBlank()) {
            loc.setCode(dto.getCode().trim().toUpperCase());
        }
        if (dto.getZone() != null) {
            loc.setZone(dto.getZone().trim());
        }
        if (dto.getDescription() != null) {
            loc.setDescription(dto.getDescription().trim());
        }
        if (dto.getActive() != null) {
            loc.setActive(dto.getActive());
        }

        loc = campusLocationRepository.save(loc);
        return toDto(loc);
    }

    @Transactional
    public CampusLocationDto toggleLocationActive(Long id) {
        CampusLocation loc = campusLocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campus location not found with id: " + id));
        loc.setActive(!Boolean.TRUE.equals(loc.getActive()));
        loc = campusLocationRepository.save(loc);
        return toDto(loc);
    }

    @Autowired
    private ItemRepository itemRepository;

    @Transactional
    public void deleteLocation(Long id) {
        CampusLocation loc = campusLocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campus location not found with id: " + id));

        long reportCount = itemRepository.countByLocationIgnoreCase(loc.getName());
        if (reportCount > 0) {
            throw new BadRequestException("Cannot delete location '" + loc.getName() + "' because it is referenced in " + reportCount + " campus report(s). You can deactivate it instead.");
        }

        campusLocationRepository.delete(loc);
    }

    public List<java.util.Map<String, Object>> getLocationDistribution() {
        List<CampusLocation> locations = campusLocationRepository.findAll();
        List<Object[]> counts = itemRepository.countItemsByAllLocations();
        java.util.Map<String, Long> countMap = new java.util.HashMap<>();
        for (Object[] row : counts) {
            if (row[0] != null) {
                countMap.put(((String) row[0]).trim().toLowerCase(), ((Number) row[1]).longValue());
            }
        }

        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        for (CampusLocation loc : locations) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", loc.getId());
            map.put("name", loc.getName());
            map.put("code", loc.getCode());
            map.put("zone", loc.getZone());
            map.put("description", loc.getDescription());
            map.put("active", loc.getActive());
            long count = countMap.getOrDefault(loc.getName().trim().toLowerCase(), 0L);
            map.put("reportCount", count);
            result.add(map);
        }
        return result;
    }

    private CampusLocationDto toDto(CampusLocation loc) {
        return new CampusLocationDto(
                loc.getId(),
                loc.getName(),
                loc.getCode(),
                loc.getZone(),
                loc.getDescription(),
                loc.getActive()
        );
    }
}
