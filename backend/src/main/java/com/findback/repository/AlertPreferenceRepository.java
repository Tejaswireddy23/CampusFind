package com.findback.repository;

import com.findback.model.AlertPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlertPreferenceRepository extends JpaRepository<AlertPreference, Long> {
    Optional<AlertPreference> findByUserId(Long userId);
    List<AlertPreference> findByEnabledTrue();
}
