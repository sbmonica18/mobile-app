package com.urbanlens.controller;

import com.urbanlens.dto.ApiMessageResponse;
import com.urbanlens.dto.PlaceItemResponse;
import com.urbanlens.dto.PlaceRequest;
import com.urbanlens.service.PlaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    @GetMapping("/searches")
    public ResponseEntity<List<PlaceItemResponse>> recentSearches(
            @AuthenticationPrincipal UserDetails principal
    ) {
        return ResponseEntity.ok(placeService.recentSearches(principal.getUsername()));
    }

    @PostMapping("/searches")
    public ResponseEntity<PlaceItemResponse> addSearch(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody PlaceRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(placeService.addSearch(principal.getUsername(), request));
    }

    @DeleteMapping("/searches/{id}")
    public ResponseEntity<ApiMessageResponse> deleteSearch(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id
    ) {
        placeService.deleteSearch(principal.getUsername(), id);
        return ResponseEntity.ok(new ApiMessageResponse("Search removed"));
    }

    @GetMapping("/saved-destinations")
    public ResponseEntity<List<PlaceItemResponse>> savedDestinations(
            @AuthenticationPrincipal UserDetails principal
    ) {
        return ResponseEntity.ok(placeService.savedDestinations(principal.getUsername()));
    }

    @PostMapping("/saved-destinations")
    public ResponseEntity<PlaceItemResponse> saveDestination(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody PlaceRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(placeService.saveDestination(principal.getUsername(), request));
    }

    @DeleteMapping("/saved-destinations/{id}")
    public ResponseEntity<ApiMessageResponse> deleteSaved(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id
    ) {
        placeService.deleteSavedDestination(principal.getUsername(), id);
        return ResponseEntity.ok(new ApiMessageResponse("Destination unsaved"));
    }
}
