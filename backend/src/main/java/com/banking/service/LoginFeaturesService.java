package com.banking.service;

import com.banking.entity.LoginFeatures;
import com.banking.repository.LoginFeaturesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LoginFeaturesService {
    
    @Autowired
    private LoginFeaturesRepository loginFeaturesRepository;
    
    public LoginFeatures saveLoginFeatures(LoginFeatures features) {
        return loginFeaturesRepository.save(features);
    }
    
    public List<LoginFeatures> getLoginFeaturesByUserId(String userId) {
        return loginFeaturesRepository.findByUserIdOrderByTimestampDesc(userId);
    }
    
    public Optional<LoginFeatures> getLatestLoginFeatures(String userId) {
        return loginFeaturesRepository.findFirstByUserIdOrderByTimestampDesc(userId);
    }
}


