package com.urbanlens.service;

import com.urbanlens.dto.PlaceItemResponse;
import com.urbanlens.dto.PlaceRequest;
import com.urbanlens.entity.SavedDestination;
import com.urbanlens.entity.SearchHistory;
import com.urbanlens.entity.User;
import com.urbanlens.repository.SavedDestinationRepository;
import com.urbanlens.repository.SearchHistoryRepository;
import com.urbanlens.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlaceService {

    private final UserRepository userRepository;
    private final SearchHistoryRepository searchHistoryRepository;
    private final SavedDestinationRepository savedDestinationRepository;

    public List<PlaceItemResponse> recentSearches(String email) {
        User user = requireUser(email);
        return searchHistoryRepository.findTop20ByUserOrderBySearchedAtDesc(user).stream()
                .map(this::toSearchResponse)
                .collect(java.util.stream.Collectors.toMap(
                        item -> item.placeName().trim().toLowerCase(Locale.ROOT),
                        item -> item,
                        (first, ignored) -> first,
                        java.util.LinkedHashMap::new
                ))
                .values()
                .stream()
                .limit(12)
                .toList();
    }

    @Transactional
    @SuppressWarnings("null")
    public PlaceItemResponse addSearch(String email, PlaceRequest request) {
        User user = requireUser(email);
        String placeName = request.placeName().trim();

        return searchHistoryRepository
                .findFirstByUserAndPlaceNameIgnoreCaseOrderBySearchedAtDesc(user, placeName)
                .map(existing -> {
                    existing.setQuery(request.query().trim());
                    existing.setPlaceName(placeName);
                    existing.setAddress(trimToNull(request.address()));
                    existing.setLatitude(request.latitude());
                    existing.setLongitude(request.longitude());
                    existing.setSearchedAt(java.time.Instant.now());
                    return toSearchResponse(searchHistoryRepository.save(existing));
                })
                .orElseGet(() -> {
                    SearchHistory saved = searchHistoryRepository.save(SearchHistory.builder()
                            .user(user)
                            .query(request.query().trim())
                            .placeName(placeName)
                            .address(trimToNull(request.address()))
                            .latitude(request.latitude())
                            .longitude(request.longitude())
                            .build());
                    return toSearchResponse(saved);
                });
    }

    @Transactional
    public void deleteSearch(String email, Long id) {
        User user = requireUser(email);
        searchHistoryRepository.deleteByIdAndUser(id, user);
    }

    public List<PlaceItemResponse> savedDestinations(String email) {
        User user = requireUser(email);
        return savedDestinationRepository.findByUserOrderBySavedAtDesc(user).stream()
                .map(this::toSavedResponse)
                .toList();
    }

    @Transactional
    @SuppressWarnings("null")
    public PlaceItemResponse saveDestination(String email, PlaceRequest request) {
        User user = requireUser(email);
        String placeKey = resolvePlaceKey(request);

        return savedDestinationRepository.findByUserAndPlaceKey(user, placeKey)
                .map(this::toSavedResponse)
                .orElseGet(() -> {
                    SavedDestination saved = savedDestinationRepository.save(SavedDestination.builder()
                            .user(user)
                            .placeKey(placeKey)
                            .placeName(request.placeName().trim())
                            .address(trimToNull(request.address()))
                            .latitude(request.latitude())
                            .longitude(request.longitude())
                            .build());
                    return toSavedResponse(saved);
                });
    }

    @Transactional
    @SuppressWarnings("null")
    public void deleteSavedDestination(String email, Long id) {
        User user = requireUser(email);
        SavedDestination saved = savedDestinationRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Saved destination not found"));
        savedDestinationRepository.delete(saved);
    }

    private User requireUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private String resolvePlaceKey(PlaceRequest request) {
        if (request.placeKey() != null && !request.placeKey().isBlank()) {
            return request.placeKey().trim();
        }
        if (request.latitude() != null && request.longitude() != null) {
            return String.format(Locale.US, "%.5f,%.5f", request.latitude(), request.longitude());
        }
        return UUID.nameUUIDFromBytes(request.placeName().trim().toLowerCase(Locale.ROOT).getBytes()).toString();
    }

    private PlaceItemResponse toSearchResponse(SearchHistory item) {
        return new PlaceItemResponse(
                item.getId(),
                null,
                item.getPlaceName(),
                item.getAddress(),
                item.getLatitude(),
                item.getLongitude(),
                item.getSearchedAt()
        );
    }

    private PlaceItemResponse toSavedResponse(SavedDestination item) {
        return new PlaceItemResponse(
                item.getId(),
                item.getPlaceKey(),
                item.getPlaceName(),
                item.getAddress(),
                item.getLatitude(),
                item.getLongitude(),
                item.getSavedAt()
        );
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
