package com.banking.controller;

import com.banking.entity.MFAFeatures;
import com.banking.service.MFAFeaturesService;
import com.banking.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/mfa-features")
@CrossOrigin(origins = "*")
public class MFAFeaturesController {
    
    @Autowired
    private MFAFeaturesService mfaFeaturesService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @GetMapping("/latest")
    public ResponseEntity<MFAFeatures> getLatestMFAFeatures(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String userId = jwtUtil.extractClaim(jwt, claims -> claims.get("userId", String.class));
            Optional<MFAFeatures> features = mfaFeaturesService.getLatestMFAFeatures(userId);
            return features.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping
    public ResponseEntity<List<MFAFeatures>> getAllMFAFeatures(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String userId = jwtUtil.extractClaim(jwt, claims -> claims.get("userId", String.class));
            return ResponseEntity.ok(mfaFeaturesService.getMFAFeaturesByUserId(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<MFAFeatures> saveMFAFeatures(@RequestHeader("Authorization") String token,
                                                      @RequestBody MFAFeatures features) {
        try {
            String jwt = token.substring(7);
            String userId = jwtUtil.extractClaim(jwt, claims -> claims.get("userId", String.class));
            features.setUserId(userId);
            return ResponseEntity.ok(mfaFeaturesService.saveMFAFeatures(features));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}


