package com.findback.repository;

import com.findback.model.Role;
import com.findback.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    Optional<User> findByStudentId(String studentId);
    boolean existsByStudentId(String studentId);

    @Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:identifier) OR LOWER(u.studentId) = LOWER(:identifier)")
    Optional<User> findByStudentIdOrEmail(@Param("identifier") String identifier);

    long countByStatus(String status);

    long countByRole(Role role);

    long countByRoleAndStatus(Role role, String status);

    @Query("SELECT u FROM User u WHERE " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:status IS NULL OR LOWER(u.status) = LOWER(:status)) AND " +
           "(:query IS NULL OR :query = '' OR (" +
           "   LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "   LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "   (u.studentId IS NOT NULL AND LOWER(u.studentId) LIKE LOWER(CONCAT('%', :query, '%'))) OR " +
           "   (u.department IS NOT NULL AND LOWER(u.department) LIKE LOWER(CONCAT('%', :query, '%')))" +
           "))")
    org.springframework.data.domain.Page<User> findStudentsFiltered(
            @Param("role") Role role,
            @Param("status") String status,
            @Param("query") String query,
            org.springframework.data.domain.Pageable pageable);
}
