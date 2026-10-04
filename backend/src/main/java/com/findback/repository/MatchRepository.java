package com.findback.repository;

import com.findback.model.Match;
import com.findback.model.MatchStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {

    Optional<Match> findByLostItemIdAndFoundItemId(Long lostItemId, Long foundItemId);

    boolean existsByLostItemIdAndFoundItemId(Long lostItemId, Long foundItemId);

    @Query("SELECT m FROM Match m WHERE m.lostItem.user.id = :userId OR m.foundItem.user.id = :userId ORDER BY m.createdAt DESC")
    List<Match> findByUserId(@Param("userId") Long userId);

    @Query("SELECT m FROM Match m WHERE (m.lostItem.user.id = :userId OR m.foundItem.user.id = :userId) AND m.status = :status ORDER BY m.createdAt DESC")
    List<Match> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") MatchStatus status);

    long countByStatus(MatchStatus status);

    @Query("SELECT m FROM Match m WHERE m.lostItem.id = :itemId OR m.foundItem.id = :itemId")
    List<Match> findByItemId(@Param("itemId") Long itemId);
}
