package com.urbanlens.service;

import com.urbanlens.dto.JourneyStoryDtos.JourneyStoryResponse;
import com.urbanlens.dto.JourneyStoryDtos.JourneyStorySaveRequest;
import com.urbanlens.entity.JourneyStory;
import com.urbanlens.entity.User;
import com.urbanlens.repository.JourneyStoryRepository;
import com.urbanlens.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JourneyStoryService {

    private final UserRepository userRepository;
    private final JourneyStoryRepository journeyStoryRepository;

    public List<JourneyStoryResponse> list(String email) {
        User user = requireUser(email);
        return journeyStoryRepository.findTop30ByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public JourneyStoryResponse save(String email, JourneyStorySaveRequest request) {
        User user = requireUser(email);
        JourneyStory entity = journeyStoryRepository
                .findByUserAndExternalId(user, request.externalId())
                .orElseGet(() -> JourneyStory.builder().user(user).externalId(request.externalId()).build());

        entity.setDestinationName(request.destinationName().trim());
        entity.setOriginName(request.originName());
        entity.setTravelScore(request.travelScore());
        entity.setDistanceKm(request.distanceKm());
        entity.setTravelMinutes(request.travelMinutes());
        entity.setDestinationId(request.destinationId());
        entity.setTotalBudgetInr(request.totalBudgetInr());
        entity.setTripDays(request.tripDays());
        entity.setNarrative(request.narrative());
        entity.setPayloadJson(request.payloadJson());

        return toResponse(journeyStoryRepository.save(entity));
    }

    private JourneyStoryResponse toResponse(JourneyStory story) {
        return new JourneyStoryResponse(
                story.getId(),
                story.getExternalId(),
                story.getDestinationName(),
                story.getOriginName(),
                story.getTravelScore(),
                story.getDistanceKm(),
                story.getTravelMinutes(),
                story.getDestinationId(),
                story.getTotalBudgetInr(),
                story.getTripDays(),
                story.getNarrative(),
                story.getPayloadJson(),
                story.getCreatedAt() != null ? story.getCreatedAt().toString() : null
        );
    }

    private User requireUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
