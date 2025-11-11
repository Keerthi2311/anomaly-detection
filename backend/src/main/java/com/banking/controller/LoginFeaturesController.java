package com.banking.controller;

import com.banking.entity.LoginFeatures;
import com.banking.service.LoginFeaturesService;
import com.banking.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/login-features")
@CrossOrigin(origins = "*")
public class LoginFeaturesController {
    
    @Autowired
    private LoginFeaturesService loginFeaturesService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @GetMapping("/latest")
    public ResponseEntity<LoginFeatures> getLatestLoginFeatures(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String userId = jwtUtil.extractClaim(jwt, claims -> claims.get("userId", String.class));
            Optional<LoginFeatures> features = loginFeaturesService.getLatestLoginFeatures(userId);
            return features.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping
    public ResponseEntity<List<LoginFeatures>> getAllLoginFeatures(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String userId = jwtUtil.extractClaim(jwt, claims -> claims.get("userId", String.class));
            return ResponseEntity.ok(loginFeaturesService.getLoginFeaturesByUserId(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<LoginFeatures> saveLoginFeatures(@RequestHeader("Authorization") String token,
                                                          @RequestBody LoginFeatures features) {
        try {
            String jwt = token.substring(7);
            String userId = jwtUtil.extractClaim(jwt, claims -> claims.get("userId", String.class));
            features.setUserId(userId);
            return ResponseEntity.ok(loginFeaturesService.saveLoginFeatures(features));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}


