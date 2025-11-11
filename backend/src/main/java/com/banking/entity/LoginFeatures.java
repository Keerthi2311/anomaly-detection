package com.banking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "login_features")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginFeatures {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String userId;
    
    @Column(nullable = false)
    private String sessionId;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    private String country;
    private String city;
    private String ipAddress;
    private String isp;
    private Integer isVpn;
    private Integer isTor;
    private Integer isProxy;
    private Integer isDatacenterIp;
    private String deviceFingerprint;
    private String deviceType;
    private Integer loginAttempts;
    private Integer failedAttempts;
    private Integer passwordCorrect;
    private Integer hourOfDay;
    private Integer dayOfWeek;
    private Integer isWeekend;
    private Integer isUnusualTime;
    
    @Column(name = "typing_speed_chars_per_min")
    private Double typingSpeedCharsPerMin;
    
    @Column(name = "mouse_movement_entropy")
    private Double mouseMovementEntropy;
    
    @Column(name = "time_to_login_seconds")
    private Double timeToLoginSeconds;
    
    private String previousCountry;
    
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


