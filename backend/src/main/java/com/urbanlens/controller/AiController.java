package com.urbanlens.controller;

import com.urbanlens.dto.AiDtos.*;
import com.urbanlens.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final GeminiService geminiService;

    @GetMapping("/decision")
    public ResponseEntity<AiDecisionResponse> getDecision(
            @RequestParam String placeName,
            @RequestParam(required = false) String purpose
    ) {
        return ResponseEntity.ok(geminiService.getDecision(placeName, purpose));
    }

    @PostMapping("/planner")
    public ResponseEntity<List<AiPlannerResponse>> getPlannerSuggestions(
            @RequestBody AiPlannerRequest request
    ) {
        return ResponseEntity.ok(geminiService.getPlannerSuggestions(request.getPrompt()));
    }

    @GetMapping("/journey-companion")
    public ResponseEntity<AiCompanionResponse> getCompanionAlerts(
            @RequestParam String placeName,
            @RequestParam double latitude,
            @RequestParam double longitude
    ) {
        return ResponseEntity.ok(geminiService.getCompanionAlerts(placeName, latitude, longitude));
    }

    @PostMapping("/journey-story")
    public ResponseEntity<AiJourneyStoryResponse> getJourneyStory(
            @RequestBody AiJourneyStoryRequest request
    ) {
        return ResponseEntity.ok(geminiService.getJourneyStory(request));
    }
}
