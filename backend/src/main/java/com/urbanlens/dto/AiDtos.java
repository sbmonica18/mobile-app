package com.urbanlens.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class AiDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AiDecisionResponse {
        private int recommendationScore;
        private int weatherRating;
        private int aqiRating;
        private int trafficRating;
        private int crowdRating;
        private int budgetRating;
        private int roadConditionsRating;
        private String reason;
        private String brief;
        private double averageBudget;
        private String bestTime;
        private String travelTime;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiPlannerRequest {
        private String prompt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AiPlannerResponse {
        private String placeName;
        private String description;
        private int matchScore;
        private String distance;
        private String budget;
        private String weather;
        private List<String> reasons;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CompanionAlert {
        private String title;
        private String detail;
        private String type; // e.g. "warning", "info", "success"
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RouteStory {
        private String title;
        private String distance;
        private String story;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AiCompanionResponse {
        private List<CompanionAlert> alerts;
        private List<RouteStory> routeStories;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AiJourneyStoryRequest {
        private String destinationName;
        private String originName;
        private Double distanceKm;
        private Double durationMinutes;
        private String weatherLabel;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AiJourneyStoryResponse {
        private String id;
        private String destinationName;
        private String originName;
        private String completedAt;
        private String weatherLabel;
        private String narrative;
        private int travelScore;
        private String destinationImage;
    }
}
