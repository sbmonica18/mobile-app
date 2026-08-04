package com.urbanlens.dto;

import jakarta.validation.constraints.NotBlank;

public class JourneyStoryDtos {

    public record JourneyStorySaveRequest(
            String externalId,
            @NotBlank String destinationName,
            String originName,
            Integer travelScore,
            Double distanceKm,
            Integer travelMinutes,
            String destinationId,
            Double totalBudgetInr,
            Integer tripDays,
            String narrative,
            String payloadJson
    ) {
    }

    public record JourneyStoryResponse(
            Long id,
            String externalId,
            String destinationName,
            String originName,
            Integer travelScore,
            Double distanceKm,
            Integer travelMinutes,
            String destinationId,
            Double totalBudgetInr,
            Integer tripDays,
            String narrative,
            String payloadJson,
            String createdAt
    ) {
    }

    public record JourneyStoryGenerateRequest(
            String destinationName,
            String originName,
            Double distanceKm,
            Double durationMinutes,
            String weatherLabel
    ) {
    }
}
