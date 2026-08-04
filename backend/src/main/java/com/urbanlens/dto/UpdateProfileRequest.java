package com.urbanlens.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(min = 2, max = 100) String fullName,
        @Size(max = 40) String preferredTravelStyle,
        @Size(max = 40) String preferredTransportMode,
        @Size(max = 40) String preferredBudgetTier,
        @Size(max = 500) String avatarUrl
) {
}
