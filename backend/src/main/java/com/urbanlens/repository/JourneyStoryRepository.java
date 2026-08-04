package com.urbanlens.repository;

import com.urbanlens.entity.JourneyStory;
import com.urbanlens.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JourneyStoryRepository extends JpaRepository<JourneyStory, Long> {

    List<JourneyStory> findTop30ByUserOrderByCreatedAtDesc(User user);

    Optional<JourneyStory> findByUserAndExternalId(User user, String externalId);
}
