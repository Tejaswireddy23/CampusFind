package com.findback.repository;

import com.findback.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE (m.sender.id = :u1 AND m.receiver.id = :u2) OR (m.sender.id = :u2 AND m.receiver.id = :u1) ORDER BY m.createdAt ASC")
    List<Message> findChatHistory(@Param("u1") Long u1, @Param("u2") Long u2);

    @Query("SELECT m FROM Message m WHERE m.receiver.id = :userId AND m.isRead = false")
    List<Message> findUnreadMessages(@Param("userId") Long userId);

    long countByReceiverIdAndIsReadFalse(Long receiverId);

    @Query("SELECT DISTINCT m.receiver.id FROM Message m WHERE m.sender.id = :userId UNION SELECT DISTINCT m.sender.id FROM Message m WHERE m.receiver.id = :userId")
    List<Long> findDistinctChatPartners(@Param("userId") Long userId);
}
