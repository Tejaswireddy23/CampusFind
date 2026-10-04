package com.findback.repository;

import com.findback.model.Item;
import com.findback.model.ItemStatus;
import com.findback.model.ItemType;
import com.findback.model.ModerationStatus;
import com.findback.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    Page<Item> findByUserId(Long userId, Pageable pageable);

    Page<Item> findByUserIdAndType(Long userId, ItemType type, Pageable pageable);

    Page<Item> findByUserIdAndStatus(Long userId, ItemStatus status, Pageable pageable);

    long countByType(ItemType type);

    long countByStatus(ItemStatus status);

    long countByModerationStatus(ModerationStatus moderationStatus);

    long countByUserId(Long userId);

    long countByUserIdAndType(Long userId, ItemType type);

    long countByUserIdAndStatus(Long userId, ItemStatus status);

    List<Item> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);

    List<Item> findTop10ByOrderByCreatedAtDesc();

    // Search and filter with parameterized queries
    @Query("SELECT i FROM Item i WHERE " +
           "(:type IS NULL OR i.type = :type) AND " +
           "(:category IS NULL OR LOWER(i.category) = LOWER(:category)) AND " +
           "(:status IS NULL OR i.status = :status) AND " +
           "(:moderationStatus IS NULL OR i.moderationStatus = :moderationStatus) AND " +
           "(:location IS NULL OR LOWER(i.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:brand IS NULL OR LOWER(i.brand) LIKE LOWER(CONCAT('%', :brand, '%'))) AND " +
           "(:color IS NULL OR LOWER(i.color) LIKE LOWER(CONCAT('%', :color, '%'))) AND " +
           "(:startDate IS NULL OR i.dateLostOrFound >= :startDate) AND " +
           "(:endDate IS NULL OR i.dateLostOrFound <= :endDate) AND " +
           "(:query IS NULL OR (" +
           "   LOWER(i.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "   LOWER(i.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "   (i.brand IS NOT NULL AND LOWER(i.brand) LIKE LOWER(CONCAT('%', :query, '%'))) OR " +
           "   (i.model IS NOT NULL AND LOWER(i.model) LIKE LOWER(CONCAT('%', :query, '%'))) OR " +
           "   LOWER(i.location) LIKE LOWER(CONCAT('%', :query, '%'))" +
           "))")
    Page<Item> searchItems(
            @Param("type") ItemType type,
            @Param("category") String category,
            @Param("status") ItemStatus status,
            @Param("moderationStatus") ModerationStatus moderationStatus,
            @Param("location") String location,
            @Param("brand") String brand,
            @Param("color") String color,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("query") String query,
            Pageable pageable
    );

    // Find candidate items for matching engine
    @Query("SELECT i FROM Item i WHERE i.type = :type AND i.status = 'ACTIVE' AND i.moderationStatus = 'APPROVED' AND i.category = :category")
    List<Item> findCandidatesForMatching(@Param("type") ItemType type, @Param("category") String category);

    // Grouping queries for analytics
    @Query("SELECT i.category, COUNT(i) FROM Item i GROUP BY i.category")
    List<Object[]> countItemsByCategory();

    @Query("SELECT i.location, COUNT(i) FROM Item i GROUP BY i.location ORDER BY COUNT(i) DESC")
    List<Object[]> countItemsByTopLocations(Pageable pageable);

    @Query("SELECT i.location, COUNT(i) FROM Item i GROUP BY i.location")
    List<Object[]> countItemsByAllLocations();

    long countByLocationIgnoreCase(String location);
}
