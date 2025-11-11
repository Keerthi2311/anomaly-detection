package com.banking.controller;

import com.banking.entity.Anomaly;
import com.banking.service.AnomalyService;
import com.banking.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/anomalies")
@CrossOrigin(origins = "*")
public class AnomalyController {
    
    @Autowired
    private AnomalyService anomalyService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @GetMapping
    public ResponseEntity<List<Anomaly>> getAnomalies(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String userId = jwtUtil.extractClaim(jwt, claims -> claims.get("userId", String.class));
            return ResponseEntity.ok(anomalyService.getAnomaliesByUserId(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<Anomaly> saveAnomaly(@RequestHeader("Authorization") String token,
                                               @RequestBody Anomaly anomaly) {
        try {
            String jwt = token.substring(7);
            String userId = jwtUtil.extractClaim(jwt, claims -> claims.get("userId", String.class));
            anomaly.setUserId(userId);
            return ResponseEntity.ok(anomalyService.saveAnomaly(anomaly));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}


