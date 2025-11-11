package com.banking.service;

import com.banking.entity.Anomaly;
import com.banking.repository.AnomalyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnomalyService {
    
    @Autowired
    private AnomalyRepository anomalyRepository;
    
    public Anomaly saveAnomaly(Anomaly anomaly) {
        return anomalyRepository.save(anomaly);
    }
    
    public List<Anomaly> getAnomaliesByUserId(String userId) {
        return anomalyRepository.findByUserIdOrderByTimestampDesc(userId);
    }
    
    public List<Anomaly> getAllAnomalies() {
        return anomalyRepository.findByIsAnomalyOrderByTimestampDesc(1);
    }
}


