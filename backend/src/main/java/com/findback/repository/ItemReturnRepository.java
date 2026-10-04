package com.findback.repository;

import com.findback.model.ItemReturn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemReturnRepository extends JpaRepository<ItemReturn, Long> {

    @Query("SELECT r FROM ItemReturn r WHERE r.owner.id = :userId OR r.finder.id = :userId ORDER BY r.returnDate DESC")
    List<ItemReturn> findByUserInvolved(@Param("userId") Long userId);

    @Query("SELECT COUNT(r) FROM ItemReturn r WHERE r.owner.id = :userId OR r.finder.id = :userId")
    long countByUserInvolved(@Param("userId") Long userId);

    long countByFinderId(Long finderId);

    long countByOwnerId(Long ownerId);
}
