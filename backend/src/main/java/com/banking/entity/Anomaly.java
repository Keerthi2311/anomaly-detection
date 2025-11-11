package com.banking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "anomalies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Anomaly {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String userId;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    private String previousCountry;
    
    @Column(name = "ip_reputation_score")
    private Integer ipReputationScore;
    
    @Column(name = "time_since_last_login_hours")
    private Double timeSinceLastLoginHours;
    
    @Column(name = "distance_from_last_login_km")
    private Double distanceFromLastLoginKm;
    
    @Column(name = "is_breached_credential")
    private Integer isBreachedCredential;
    
    @Column(name = "mfa_method")
    private String mfaMethod;
    
    @Column(name = "mfa_method_changed")
    private Integer mfaMethodChanged;
    
    @Column(name = "push_notification_count")
    private Integer pushNotificationCount;
    
    @Column(name = "concurrent_sessions")
    private Integer concurrentSessions;
    
    @Column(name = "session_duration_last_minutes")
    private Double sessionDurationLastMinutes;
    
    @Column(name = "velocity_score")
    private Integer velocityScore;
    
    @Column(name = "device_trust_score")
    private Integer deviceTrustScore;
    
    @Column(name = "location_trust_score")
    private Integer locationTrustScore;
    
    @Column(name = "risk_score")
    private Integer riskScore;
    
    @Column(name = "is_anomaly")
    private Integer isAnomaly;
    
    @Column(name = "anomaly_category")
    private String anomalyCategory;
    
    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
    
    // Manual setter method for Lombok compatibility
    public void setUserId(String userId) {
        this.userId = userId;
    }
}


