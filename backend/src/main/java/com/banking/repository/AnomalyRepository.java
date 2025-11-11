package com.banking.repository;

import com.banking.entity.Anomaly;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnomalyRepository extends JpaRepository<Anomaly, String> {
    List<Anomaly> findByUserIdOrderByTimestampDesc(String userId);
    List<Anomaly> findByIsAnomalyOrderByTimestampDesc(Integer isAnomaly);
}


