package com.findback.repository;

import com.findback.model.Claim;
import com.findback.model.ClaimStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    List<Claim> findByItemId(Long itemId);

    List<Claim> findByClaimantId(Long claimantId);

    @Query("SELECT c FROM Claim c WHERE c.item.user.id = :finderId ORDER BY c.createdAt DESC")
    List<Claim> findByItemOwnerId(@Param("finderId") Long finderId);

    @Query("SELECT c FROM Claim c WHERE c.claimant.id = :userId OR c.item.user.id = :userId ORDER BY c.createdAt DESC")
    List<Claim> findUserInvolvedClaims(@Param("userId") Long userId);

    long countByStatus(ClaimStatus status);

    long countByClaimantId(Long claimantId);

    long countByClaimantIdAndStatus(Long claimantId, ClaimStatus status);

    long countByItemId(Long itemId);

    Page<Claim> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
