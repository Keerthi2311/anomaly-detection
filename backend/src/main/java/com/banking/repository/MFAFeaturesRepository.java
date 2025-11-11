package com.banking.repository;

import com.banking.entity.MFAFeatures;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MFAFeaturesRepository extends JpaRepository<MFAFeatures, String> {
    List<MFAFeatures> findByUserIdOrderByTimestampDesc(String userId);
    Optional<MFAFeatures> findFirstByUserIdOrderByTimestampDesc(String userId);
}


