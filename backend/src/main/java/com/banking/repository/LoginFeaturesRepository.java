package com.banking.repository;

import com.banking.entity.LoginFeatures;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoginFeaturesRepository extends JpaRepository<LoginFeatures, String> {
    List<LoginFeatures> findByUserIdOrderByTimestampDesc(String userId);
    Optional<LoginFeatures> findFirstByUserIdOrderByTimestampDesc(String userId);
}


