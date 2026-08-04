package com.urbanlens.dto;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String preferredTravelStyle,
        String preferredTransportMode,
        String preferredBudgetTier,
        String avatarUrl
) {
}
