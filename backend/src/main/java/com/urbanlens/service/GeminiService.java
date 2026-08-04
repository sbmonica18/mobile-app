package com.urbanlens.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.urbanlens.dto.AiDtos.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    @Value("${urbanlens.gemini.api-key:}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    public AiDecisionResponse getDecision(String placeName, String purpose) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.startsWith("YOUR_")) {
            return generateFallbackDecision(placeName, purpose);
        }

        try {
            String prompt = String.format(
                    "You are the AI travel brain of UrbanLens. Analyze the destination '%s' for the travel purpose '%s' today. " +
                    "Return ONLY a raw JSON object (no markdown code blocks, no ```json) that matches this schema exactly:\n" +
                    "{\n" +
                    "  \"recommendationScore\": 95,\n" +
                    "  \"weatherRating\": 5,\n" +
                    "  \"aqiRating\": 5,\n" +
                    "  \"trafficRating\": 4,\n" +
                    "  \"crowdRating\": 4,\n" +
                    "  \"budgetRating\": 5,\n" +
                    "  \"roadConditionsRating\": 5,\n" +
                    "  \"reason\": \"summary string of why recommended/not\",\n" +
                    "  \"brief\": \"one or two sentence summary\",\n" +
                    "  \"averageBudget\": 3200,\n" +
                    "  \"bestTime\": \"4 PM - 7 PM\",\n" +
                    "  \"travelTime\": \"4h\"\n" +
                    "}\n" +
                    "Make sure ratings are integers between 1 and 5. recommendationScore is between 0 and 100.",
                    placeName, purpose != null ? purpose : "leisure"
            );

            String responseText = callGeminiApi(prompt);
            return objectMapper.readValue(responseText, AiDecisionResponse.class);
        } catch (Exception e) {
            log.error("Error calling Gemini API for decision, falling back to mock", e);
            return generateFallbackDecision(placeName, purpose);
        }
    }

    public List<AiPlannerResponse> getPlannerSuggestions(String promptText) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.startsWith("YOUR_")) {
            return generateFallbackPlanner(promptText);
        }

        try {
            String prompt = String.format(
                    "You are the AI Planner for UrbanLens. Based on this travel request: '%s', " +
                    "recommend 3 suitable destinations ONLY from this catalog: " +
                    "Delhi, Agra, Jaipur, Goa, Mumbai, Varanasi, Haridwar, Rishikesh, Manali, Shimla, " +
                    "Udaipur, Jodhpur, Jaisalmer, Amritsar, Bangalore, Mysore, Ooty, Munnar, Kochi, Alleppey, " +
                    "Darjeeling, Gangtok, Nainital, Mussoorie, Leh-Ladakh, Shirdi, Tirupati, Vaishno Devi (Katra), " +
                    "Bodh Gaya, Puri, Khajuraho, Hampi, Ajanta & Ellora (Aurangabad), Kolkata, Chennai, Hyderabad, " +
                    "Pondicherry, Kovalam, Andaman Islands, Mount Abu, Pushkar, Dwarka, Rameswaram, Madurai, " +
                    "Coorg, Wayanad, Kodaikanal, Mahabaleshwar, Rann of Kutch, Ranthambore. " +
                    "Match the user's intent (pilgrimage/spiritual, heritage/monuments, metro/urban, beach/coastal, " +
                    "hill station, wildlife/safari, adventure/Himalayan, budget, family, food, weekend, Rajasthan, " +
                    "Kerala, etc.). " +
                    "Only return an empty JSON array [] for nonsense queries — never for beach/heritage/wildlife/" +
                    "pilgrimage when catalog matches exist. " +
                    "Return ONLY a raw JSON array (no markdown) where each item matches this schema:\n" +
                    "{\n" +
                    "  \"placeName\": \"Munnar\",\n" +
                    "  \"description\": \"Tea gardens and quiet valleys for a calm escape.\",\n" +
                    "  \"matchScore\": 92,\n" +
                    "  \"distance\": \"150 km\",\n" +
                    "  \"budget\": \"₹3500\",\n" +
                    "  \"weather\": \"22°C Clear\",\n" +
                    "  \"reasons\": [\"Matches nature intent\", \"Good AQI\"]\n" +
                    "}",
                    promptText
            );

            String responseText = callGeminiApi(prompt);
            return Arrays.asList(objectMapper.readValue(responseText, AiPlannerResponse[].class));
        } catch (Exception e) {
            log.error("Error calling Gemini API for planner, falling back to mock", e);
            return generateFallbackPlanner(promptText);
        }
    }

    public AiCompanionResponse getCompanionAlerts(String placeName, double latitude, double longitude) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.startsWith("YOUR_")) {
            return generateFallbackCompanion(placeName, latitude, longitude);
        }

        try {
            String prompt = String.format(
                    "You are the Live Journey Companion for UrbanLens. The user is currently traveling to '%s' (coordinates: %f, %f). " +
                    "Generate 2 live journey alerts (weather, traffic or parking) and 2 smart route stories about points of interest along the way. " +
                    "Return ONLY a raw JSON object (no markdown code blocks, no ```json) that matches this schema exactly:\n" +
                    "{\n" +
                    "  \"alerts\": [\n" +
                    "    { \"title\": \"Rain expected\", \"detail\": \"Drizzle in 20 mins on your path\", \"type\": \"warning\" }\n" +
                    "  ],\n" +
                    "  \"routeStories\": [\n" +
                    "    { \"title\": \"Historic Temple\", \"distance\": \"600m\", \"story\": \"This temple is over 400 years old.\" }\n" +
                    "  ]\n" +
                    "}\n" +
                    "Alert types must be 'warning', 'info', or 'success'. Keep route stories short, fascinating and engaging.",
                    placeName, latitude, longitude
            );

            String responseText = callGeminiApi(prompt);
            return objectMapper.readValue(responseText, AiCompanionResponse.class);
        } catch (Exception e) {
            log.error("Error calling Gemini API for companion, falling back to mock", e);
            return generateFallbackCompanion(placeName, latitude, longitude);
        }
    }

    private String callGeminiApi(String prompt) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> partContainer = new HashMap<>();
        partContainer.put("parts", Collections.singletonList(textPart));

        Map<String, Object> contents = new HashMap<>();
        contents.put("contents", Collections.singletonList(partContainer));

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");
        contents.put("generationConfig", generationConfig);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(contents, headers);
        String response = restTemplate.postForObject(url, entity, String.class);

        JsonNode rootNode = objectMapper.readTree(response);
        String rawJson = rootNode.path("candidates")
                .path(0)
                .path("content")
                .path("parts")
                .path(0)
                .path("text")
                .asText();

        // Strip backticks if present
        if (rawJson.contains("```json")) {
            rawJson = rawJson.substring(rawJson.indexOf("```json") + 7);
            rawJson = rawJson.substring(0, rawJson.lastIndexOf("```"));
        } else if (rawJson.contains("```")) {
            rawJson = rawJson.substring(rawJson.indexOf("```") + 3);
            rawJson = rawJson.substring(0, rawJson.lastIndexOf("```"));
        }

        return rawJson.trim();
    }

    // --- FALLBACK MOCK ENGINE ---

    private AiDecisionResponse generateFallbackDecision(String placeName, String purpose) {
        String baseName = placeName.split(",")[0].trim();
        int hash = Math.abs(baseName.hashCode());

        // Consistent score and ratings per place name
        int score = 75 + (hash % 21); // 75 - 95
        int weather = 3 + (hash % 3); // 3 - 5
        int aqi = 3 + ((hash / 3) % 3);
        int traffic = 2 + ((hash / 9) % 4);
        int crowd = 2 + ((hash / 27) % 4);
        int budget = 3 + ((hash / 81) % 3);
        int road = 4 + ((hash / 243) % 2);

        String weatherText = weather >= 4 ? "Pleasant Weather" : "Fair Weather";
        String crowdText = crowd <= 3 ? "Moderate Crowd" : "Busy Crowds";
        String aqiText = aqi >= 4 ? "Excellent AQI" : "Acceptable AQI";
        String budgetText = "Within Budget";

        String reason = String.join(", ", weatherText, crowdText, aqiText, budgetText, "Clear Roads");
        String brief = String.format("%s is highly recommended for your trip. The current weather is pleasant with clear roads and manageable crowds.", baseName);
        double avgBudget = 2500 + (hash % 15) * 200;

        return AiDecisionResponse.builder()
                .recommendationScore(score)
                .weatherRating(weather)
                .aqiRating(aqi)
                .trafficRating(traffic)
                .crowdRating(crowd)
                .budgetRating(budget)
                .roadConditionsRating(road)
                .reason(reason)
                .brief(brief)
                .averageBudget(avgBudget)
                .bestTime("4 PM - 7 PM")
                .travelTime("3h")
                .build();
    }

    private List<AiPlannerResponse> generateFallbackPlanner(String promptText) {
        // Prefer the user's typed query — ignore appended "Context: …" so budget chips
        // don't force every search into the same budget branch.
        String raw = promptText == null ? "" : promptText;
        String lower = raw.toLowerCase();
        int ctxIdx = lower.indexOf(". context:");
        if (ctxIdx < 0) ctxIdx = lower.indexOf(" context:");
        String query = (ctxIdx > 0 ? lower.substring(0, ctxIdx) : lower).trim();
        if (query.isEmpty()) {
            query = lower;
        }

        // Nonsense / too short → empty (no silent default place)
        if (query.length() < 3 || query.matches("^[\\W\\d]+$")
                || query.matches(".*(asdf|qwer|zxcv|lorem|test123|blahblah).*")) {
            return List.of();
        }

        List<AiPlannerResponse> picked = new ArrayList<>();

        if (query.matches(".*\\b(pilgrimage|temple|darshan|shrine|spiritual)\\b.*")) {
            picked.add(place("Varanasi", "Ganga aarti at the ghats — India’s spiritual heart.", 95, "6h", "₹2,200", "Warm & misty", "Pilgrimage", "Ghats"));
            picked.add(place("Amritsar", "Golden Temple langar and serene darshan energy.", 93, "8h", "₹2,900", "Seasonal", "Pilgrimage", "Heritage"));
            picked.add(place("Tirupati", "Tirumala hill temple darshan circuit.", 91, "5h", "₹1,900", "Warm hills", "Pilgrimage", "Temple"));
        } else if (query.matches(".*\\b(beach|coast|sea|ocean|island)\\b.*")) {
            picked.add(place("Goa", "Palolem sands and sunset shacks — classic coastal escape.", 95, "12h", "₹5,200", "Tropical breezy", "Beach", "Sunset"));
            picked.add(place("Andaman Islands", "Radhanagar white sand and turquoise reefs.", 93, "Flight+", "₹7,500", "Island tropical", "Beach", "Adventure"));
            picked.add(place("Pondicherry", "French Quarter lanes and Promenade beach.", 90, "5h", "₹2,800", "Warm & breezy", "Beach", "Heritage"));
        } else if (query.matches(".*\\b(heritage|fort|palace|monument|architecture)\\b.*")
                || query.contains("rajasthan")) {
            if (query.contains("rajasthan") || query.matches(".*\\b(jaipur|udaipur|jaisalmer|jodhpur)\\b.*")) {
                picked.add(place("Jaipur", "Pink City forts and Hawa Mahal façades.", 95, "Flight+", "₹3,800", "Dry heat", "Heritage", "Fort"));
                picked.add(place("Udaipur", "Lake Pichola palaces — romantic heritage city.", 94, "Flight+", "₹4,200", "Mild evenings", "Heritage", "Lake"));
                picked.add(place("Jodhpur", "Blue City lanes under Mehrangarh Fort.", 90, "Flight+", "₹3,600", "Dry & bright", "Heritage", "Architecture"));
            } else {
                picked.add(place("Agra", "Taj Mahal dawn and Agra Fort ramparts.", 96, "4h", "₹2,800", "Dry heat", "Heritage", "Monument"));
                picked.add(place("Hampi", "Vijayanagara ruins among boulder hills.", 94, "8h", "₹2,500", "Hot & dry", "Heritage", "Photo"));
                picked.add(place("Mysore", "Illuminated palace nights and Chamundi Hill.", 91, "3h", "₹2,700", "Pleasant", "Heritage", "Family"));
            }
        } else if (query.matches(".*\\b(wildlife|safari|tiger)\\b.*")) {
            picked.add(place("Ranthambore", "Tiger safaris amid fort ruins — top Rajasthan wildlife.", 95, "10h", "₹5,500", "Dry warm", "Wildlife", "Safari"));
            picked.add(place("Wayanad", "Western Ghats wildlife sanctuaries and forest drives.", 92, "9h", "₹3,500", "Cloudy", "Wildlife", "Nature"));
            picked.add(place("Rann of Kutch", "Seasonal salt desert and wildlife-edge nature stays.", 88, "18h", "₹3,800", "Dry & windy", "Nature", "Desert"));
        } else if (query.matches(".*\\b(desert|dune|rann)\\b.*")) {
            picked.add(place("Jaisalmer", "Golden fort and Thar dune camps.", 95, "Flight+", "₹4,800", "Desert heat", "Desert", "Heritage"));
            picked.add(place("Rann of Kutch", "White salt flats best visited in winter months.", 92, "18h", "₹3,800", "Dry & windy", "Desert", "Festival"));
            picked.add(place("Jodhpur", "Blue City gateway to the desert edge.", 88, "Flight+", "₹3,600", "Dry & bright", "Heritage", "Scenic"));
        } else if (query.matches(".*\\b(metro|city|urban|biryani)\\b.*")
                || query.matches(".*\\b(food|cafe|cuisine)\\b.*")) {
            if (query.contains("biryani") || query.contains("hyderabad")) {
                picked.add(place("Hyderabad", "Charminar lanes and biryani-forward Nawabi heritage.", 95, "6h", "₹4,100", "Warm dry", "Food", "Metro"));
                picked.add(place("Delhi", "Old Delhi lanes, monuments, and capital food trails.", 92, "2h", "₹4,500", "Warm & hazy", "Metro", "Culture"));
                picked.add(place("Mumbai", "Street-food nights and Marine Drive urban energy.", 90, "14h", "₹5,800", "Humid coastal", "Metro", "Food"));
            } else {
                picked.add(place("Delhi", "India Gate evenings and Mughal monuments.", 94, "2h", "₹4,500", "Warm & hazy", "Metro", "Heritage"));
                picked.add(place("Mumbai", "Gateway of India and maximum city energy.", 92, "14h", "₹5,800", "Humid coastal", "Metro", "Coastal"));
                picked.add(place("Bangalore", "Garden-city cafés and brewery trails.", 90, "0h", "₹4,800", "Pleasant", "Metro", "Cafe"));
            }
        } else if (query.matches(".*\\b(family|kids|children)\\b.*")) {
            picked.add(place("Ooty", "Lakeside walks and gardens for the whole family.", 95, "5h 30m", "₹3,200", "Cool & misty", "Family", "Hills"));
            picked.add(place("Mysore", "Palace and gardens for an easy family day trip.", 91, "3h", "₹2,700", "Pleasant", "Family", "Heritage"));
            picked.add(place("Nainital", "Mall Road lake loops and cable-car hill charm.", 88, "7h", "₹3,200", "Cool lake breeze", "Family", "Lake"));
        } else if (query.matches(".*\\b(cheap|budget|affordable|under)\\b.*")
                || query.contains("₹1000") || query.contains("₹3000") || query.contains("1000") || query.contains("3000")) {
            picked.add(place("Haridwar", "Temple-town pilgrimage that fits a tight budget.", 93, "5h", "₹1,800", "Pleasant", "Budget", "Pilgrimage"));
            picked.add(place("Shirdi", "Sai Baba darshan with budget-friendly stays.", 90, "12h", "₹1,600", "Warm plains", "Budget", "Pilgrimage"));
            picked.add(place("Pushkar", "Holy lake ghats and desert-town colour on a budget.", 88, "10h", "₹2,100", "Desert mild", "Budget", "Culture"));
        } else if (query.matches(".*\\b(adventure|trek|trekking|hike|raft)\\b.*")) {
            picked.add(place("Leh-Ladakh", "High-altitude passes, Pangong blues, Nubra dunes.", 95, "Flight+", "₹8,500", "High-altitude dry", "Adventure", "Mountains"));
            picked.add(place("Rishikesh", "Ganga rafting and yoga-capital trail energy.", 93, "6h", "₹2,600", "Cool river breeze", "Adventure", "Pilgrimage"));
            picked.add(place("Manali", "Solang adventures and Himalayan base vibes.", 90, "14h+", "₹4,500", "Alpine cool", "Adventure", "Mountains"));
        } else if (query.matches(".*\\b(photo|photography|sunset|scenic|view)\\b.*")) {
            picked.add(place("Udaipur", "Lake palace frames and rooftop golden hour.", 94, "10h", "₹4,200", "Mild evenings", "Photo", "Heritage"));
            picked.add(place("Jaisalmer", "Golden fort and desert sunset camps.", 92, "16h", "₹4,800", "Desert heat", "Photo", "Desert"));
            picked.add(place("Munnar", "Tea-estate valleys perfect for misty frames.", 90, "7h", "₹3,800", "Pleasant", "Photo", "Hills"));
        } else if (query.matches(".*\\b(rain|monsoon|misty)\\b.*")) {
            picked.add(place("Munnar", "Misty tea valleys that shine in soft rain.", 94, "7h", "₹3,800", "Pleasant", "Rainy", "Hills"));
            picked.add(place("Coorg", "Coffee estates and waterfall trails in the rains.", 90, "8h", "₹4,100", "Light showers", "Rainy", "Forest"));
            picked.add(place("Wayanad", "Forest drives and waterfalls in monsoon green.", 88, "9h", "₹3,500", "Cloudy", "Rainy", "Nature"));
        } else if (query.matches(".*\\b(weekend|short|nearby|quick|day trip)\\b.*")) {
            picked.add(place("Mysore", "Royal heritage day trip within easy driving distance.", 94, "3h", "₹2,700", "Pleasant", "Weekend", "Heritage"));
            picked.add(place("Pondicherry", "Beach + French Quarter weekend escape.", 92, "5h", "₹2,800", "Warm & breezy", "Weekend", "Beach"));
            picked.add(place("Nainital", "Lake hill weekend with Mall Road walks.", 90, "7h", "₹3,200", "Cool lake breeze", "Weekend", "Family"));
        } else if (query.matches(".*\\b(backwater|houseboat)\\b.*")) {
            picked.add(place("Alleppey", "Houseboat canals and palm-lined lagoons.", 95, "9h", "₹4,600", "Tropical humid", "Backwaters", "Romantic"));
            picked.add(place("Kochi", "Fort Kochi base with easy backwater day trips.", 90, "8h", "₹3,400", "Humid coastal", "Coastal", "Food"));
            picked.add(place("Kovalam", "Kerala coastal stay after the backwaters.", 86, "12h", "₹3,400", "Tropical", "Beach", "Relax"));
        } else if (query.matches(".*\\b(mountain|hill|nature|forest|lake)\\b.*")) {
            picked.add(place("Munnar", "Tea gardens and quiet valleys for a calm escape.", 95, "7h", "₹3,800", "Pleasant", "Nature", "Hills"));
            picked.add(place("Manali", "Beas valley cedar forests and alpine cool.", 92, "14h", "₹4,500", "Alpine cool", "Mountains", "Adventure"));
            picked.add(place("Ooty", "Nilgiri lake mornings and botanical gardens.", 90, "5h 30m", "₹3,200", "Cool & misty", "Nature", "Lake"));
        } else if (query.matches(".*\\b(hidden|quiet|peaceful|calm|gem)\\b.*")) {
            picked.add(place("Pushkar", "Quieter holy-lake lanes beyond the fair crowds.", 92, "10h", "₹2,100", "Desert mild", "Quiet", "Culture"));
            picked.add(place("Mount Abu", "Rajasthan’s cool hill pocket with Nakki Lake.", 90, "12h", "₹3,000", "Cool hill pocket", "Hills", "Quiet"));
            picked.add(place("Kodaikanal", "Pine forests and star-shaped lake calm.", 89, "6h", "₹2,900", "Fresh breeze", "Hills", "Romantic"));
        } else if (query.matches(".*\\b(road|drive|ghat)\\b.*")) {
            picked.add(place("Wayanad", "Scenic Western Ghats drives with nature stops.", 93, "9h", "₹3,500", "Cloudy", "Drive", "Nature"));
            picked.add(place("Coorg", "Coffee-estate ghat roads and misty Kodagu trails.", 90, "8h", "₹4,100", "Light showers", "Drive", "Forest"));
            picked.add(place("Mahabaleshwar", "Sahyadri viewpoint circuit for a road weekend.", 88, "14h", "₹4,500", "Pleasant", "Drive", "Hills"));
        } else {
            List<AiPlannerResponse> pool = List.of(
                    place("Delhi", "Capital monuments and Old Delhi culture.", 92, "2h", "₹4,500", "Warm & hazy", "Metro", "Heritage"),
                    place("Goa", "Classic beach escape with sunset shacks.", 91, "12h", "₹5,200", "Tropical breezy", "Beach", "Relax"),
                    place("Jaipur", "Pink City forts and bazaar energy.", 90, "8h", "₹3,800", "Dry heat", "Heritage", "Culture"),
                    place("Varanasi", "Ganga aarti and dawn boat rides.", 89, "6h", "₹2,200", "Warm & misty", "Pilgrimage", "Culture"),
                    place("Munnar", "Tea gardens and quiet hill valleys.", 88, "7h", "₹3,800", "Pleasant", "Nature", "Hills"),
                    place("Udaipur", "Lake palaces and romantic heritage nights.", 87, "10h", "₹4,200", "Mild evenings", "Heritage", "Romantic")
            );
            int start = Math.floorMod(query.hashCode(), pool.size());
            for (int i = 0; i < 3; i++) {
                picked.add(pool.get((start + i) % pool.size()));
            }
        }

        return picked;
    }

    private AiPlannerResponse place(
            String name,
            String description,
            int score,
            String distance,
            String budget,
            String weather,
            String reason1,
            String reason2
    ) {
        return new AiPlannerResponse(
                name,
                description,
                score,
                distance,
                budget,
                weather,
                Arrays.asList(reason1, reason2)
        );
    }

    private AiCompanionResponse generateFallbackCompanion(String placeName, double latitude, double longitude) {
        String baseName = placeName.split(",")[0].trim();
        List<CompanionAlert> alerts = new ArrayList<>();
        List<RouteStory> stories = new ArrayList<>();

        alerts.add(CompanionAlert.builder()
                .title("Weather alert")
                .detail("Light rain showers expected in 20 minutes on your path. Drive carefully.")
                .type("warning")
                .build());

        alerts.add(CompanionAlert.builder()
                .title("Parking availability")
                .detail("Parking spot updates: Main lot near " + baseName + " is 80% full, but alternate space is open.")
                .type("info")
                .build());

        stories.add(RouteStory.builder()
                .title("Historic Temple")
                .distance("600m")
                .story("You are approaching a heritage zone. An ancient temple built in the 8th century is situated 600m to your right.")
                .build());

        stories.add(RouteStory.builder()
                .title("Sunset Viewpoint")
                .distance("8km")
                .story("A scenic valley viewpoint will appear on your left in 8 km. Ideal sunset viewing time is around 6:15 PM today!")
                .build());

        return AiCompanionResponse.builder()
                .alerts(alerts)
                .routeStories(stories)
                .build();
    }

    public AiJourneyStoryResponse getJourneyStory(AiJourneyStoryRequest request) {
        String dest = request.getDestinationName() != null ? request.getDestinationName().split(",")[0].trim() : "your destination";
        String origin = request.getOriginName() != null ? request.getOriginName().split(",")[0].trim() : "home";
        String weather = request.getWeatherLabel() != null ? request.getWeatherLabel() : "pleasant skies";
        double km = request.getDistanceKm() != null ? request.getDistanceKm() : 180;
        int score = (int) Math.min(98, Math.max(82, 90 - (km / 50)));

        String narrative = String.format(
                "Today you left %s behind and found your way into the calm of %s. %s, manageable traffic, and clean air made this one of your smoothest escapes. Across %.0f km you collected quiet viewpoints and arrived with time to spare — a journey worth remembering.",
                origin, dest, weather, km
        );

        if (apiKey != null && !apiKey.trim().isEmpty() && !apiKey.startsWith("YOUR_")) {
            try {
                String prompt = String.format(
                        "Write a warm, cinematic 3-4 sentence travel story for UrbanLens. Origin: %s. Destination: %s. Distance: %.1f km. Weather: %s. Return ONLY raw JSON: {\"narrative\":\"...\",\"travelScore\":90}",
                        origin, dest, km, weather
                );
                String responseText = callGeminiApi(prompt);
                JsonNode node = objectMapper.readTree(responseText);
                if (node.has("narrative")) {
                    narrative = node.get("narrative").asText(narrative);
                }
                if (node.has("travelScore")) {
                    score = node.get("travelScore").asInt(score);
                }
            } catch (Exception e) {
                log.warn("Journey story Gemini fallback used: {}", e.getMessage());
            }
        }

        return AiJourneyStoryResponse.builder()
                .id("journey_" + System.currentTimeMillis())
                .destinationName(dest)
                .originName(origin)
                .completedAt(java.time.LocalDateTime.now().toString())
                .weatherLabel(weather)
                .narrative(narrative)
                .travelScore(score)
                .destinationImage("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80")
                .build();
    }
}
