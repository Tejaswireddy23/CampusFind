package com.findback.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.sql.Connection;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @Autowired(required = false)
    private DataSource dataSource;

    @Value("${campusfind.seed.sample-data:true}")
    private boolean sampleDataEnabled;

    @Value("${campusfind.storage.type:LOCAL}")
    private String storageType;

    @GetMapping({"/health", "/api/health", "/"})
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "CampusFind API");
        response.put("status", "ok");
        response.put("version", "1.0.0");
        response.put("timestamp", Instant.now().toString());
        response.put("uptimeSeconds", ManagementFactory.getRuntimeMXBean().getUptime() / 1000);
        response.put("environment", sampleDataEnabled ? "development" : "production");
        response.put("storageType", storageType);

        boolean dbConnected = false;
        if (dataSource != null) {
            try (Connection conn = dataSource.getConnection()) {
                dbConnected = conn.isValid(2);
            } catch (Exception ex) {
                dbConnected = false;
            }
        }

        response.put("database", dbConnected ? "CONNECTED" : "DISCONNECTED");

        // Returns HTTP 200 OK so Render and cloud health probes pass reliably
        return ResponseEntity.ok(response);
    }
}
