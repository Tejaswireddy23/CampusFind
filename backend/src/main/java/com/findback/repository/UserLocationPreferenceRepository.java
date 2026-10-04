package com.findback.repository;

import com.findback.model.UserLocationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserLocationPreferenceRepository extends JpaRepository<UserLocationPreference, Long> {
    List<UserLocationPreference> findByUserId(Long userId);
    List<UserLocationPreference> findByEnabledTrue();
    Optional<UserLocationPreference> findByUserIdAndEnabledTrue(Long userId);
}
