package com.urbanlens.repository;

import com.urbanlens.entity.SearchHistory;
import com.urbanlens.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {

    List<SearchHistory> findTop20ByUserOrderBySearchedAtDesc(User user);

    Optional<SearchHistory> findFirstByUserAndPlaceNameIgnoreCaseOrderBySearchedAtDesc(User user, String placeName);

    void deleteByIdAndUser(Long id, User user);
}
