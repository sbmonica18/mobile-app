package com.urbanlens.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Phase 11 — UrbanLens Now intelligence snapshot.
 * Mobile still runs a richer on-device engine; this endpoint provides a clean API shape
 * for future live providers without hardcoding a single vendor.
 */
@RestController
@RequestMapping("/api/intelligence")
public class IntelligenceController {

    @GetMapping("/now")
    public ResponseEntity<Map<String, Object>> now(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String time
    ) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("updatedAt", Instant.now().toString());
        body.put("area", lat != null && lng != null
                ? Map.of("lat", lat, "lng", lng)
                : Map.of("note", "location optional"));
        body.put("destination", destination);
        body.put("clientTime", time);
        body.put("signals", List.of(
                signal("weather", "available", "Use Open-Meteo from client"),
                signal("traffic", "estimated", "Time-of-day heuristic only"),
                signal("crowd", "estimated", "Time-of-day heuristic only"),
                signal("parking", "estimated", "Time-of-day heuristic only"),
                signal("roads", "unavailable", "No live closure feed connected")
        ));
        body.put("events", List.of(
                Map.of(
                        "id", "api-partial",
                        "type", "SIGNAL_GAP",
                        "priority", "LOW",
                        "title", "Partial server intelligence",
                        "description", "Full UrbanLens Now scoring runs on-device using live weather + labeled estimates.",
                        "recommendation", "Open UrbanLens Now in the app for the full feed.",
                        "source", "partial"
                )
        ));
        body.put("recommendations", List.of());
        body.put("actions", List.of("OPEN_NOW", "BUILD_PLAN"));
        body.put("note", "Do not treat estimated mobility as live traffic.");
        return ResponseEntity.ok(body);
    }

    private static Map<String, String> signal(String key, String status, String valueLabel) {
        Map<String, String> s = new LinkedHashMap<>();
        s.put("key", key);
        s.put("status", status);
        s.put("valueLabel", valueLabel);
        return s;
    }
}
