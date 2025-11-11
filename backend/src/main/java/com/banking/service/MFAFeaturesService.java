package com.banking.service;

import com.banking.entity.MFAFeatures;
import com.banking.repository.MFAFeaturesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MFAFeaturesService {
    
    @Autowired
    private MFAFeaturesRepository mfaFeaturesRepository;
    
    public MFAFeatures saveMFAFeatures(MFAFeatures features) {
        return mfaFeaturesRepository.save(features);
    }
    
    public List<MFAFeatures> getMFAFeaturesByUserId(String userId) {
        return mfaFeaturesRepository.findByUserIdOrderByTimestampDesc(userId);
    }
    
    public Optional<MFAFeatures> getLatestMFAFeatures(String userId) {
        return mfaFeaturesRepository.findFirstByUserIdOrderByTimestampDesc(userId);
    }
}


