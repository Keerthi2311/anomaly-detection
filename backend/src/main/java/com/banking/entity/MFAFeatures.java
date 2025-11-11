package com.banking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "mfa_features")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MFAFeatures {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String userId;
    
    @Column(nullable = false)
    private String sessionId;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(name = "mfa_required")
    private Integer mfaRequired;
    
    @Column(name = "mfa_attempts")
    private Integer mfaAttempts;
    
    @Column(name = "mfa_success")
    private Integer mfaSuccess;
    
    @Column(name = "mfa_time_taken_seconds")
    private Double mfaTimeTakenSeconds;
    
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


