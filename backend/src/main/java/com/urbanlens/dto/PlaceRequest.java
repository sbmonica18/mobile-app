package com.urbanlens.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PlaceRequest(
        @NotBlank @Size(max = 255) String query,
        @NotBlank @Size(max = 255) String placeName,
        @Size(max = 400) String address,
        Double latitude,
        Double longitude,
        String placeKey
) {
}
