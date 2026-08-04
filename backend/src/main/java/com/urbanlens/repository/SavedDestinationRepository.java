package com.urbanlens.repository;

import com.urbanlens.entity.SavedDestination;
import com.urbanlens.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedDestinationRepository extends JpaRepository<SavedDestination, Long> {

    List<SavedDestination> findByUserOrderBySavedAtDesc(User user);

    Optional<SavedDestination> findByIdAndUser(Long id, User user);

    Optional<SavedDestination> findByUserAndPlaceKey(User user, String placeKey);

    boolean existsByUserAndPlaceKey(User user, String placeKey);

    void deleteByIdAndUser(Long id, User user);
}
