package com.urbanlens.controller;

import com.urbanlens.dto.JourneyStoryDtos.JourneyStoryResponse;
import com.urbanlens.dto.JourneyStoryDtos.JourneyStorySaveRequest;
import com.urbanlens.service.JourneyStoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/journey-stories")
@RequiredArgsConstructor
public class JourneyStoryController {

    private final JourneyStoryService journeyStoryService;

    @GetMapping
    public ResponseEntity<List<JourneyStoryResponse>> list(
            @AuthenticationPrincipal UserDetails principal
    ) {
        return ResponseEntity.ok(journeyStoryService.list(principal.getUsername()));
    }

    @PostMapping
    public ResponseEntity<JourneyStoryResponse> save(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody JourneyStorySaveRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(journeyStoryService.save(principal.getUsername(), request));
    }
}
