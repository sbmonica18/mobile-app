package com.urbanlens.dto;

import java.time.Instant;

public record PlaceItemResponse(
        Long id,
        String placeKey,
        String placeName,
        String address,
        Double latitude,
        Double longitude,
        Instant timestamp
) {
}
