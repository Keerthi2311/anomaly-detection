package com.banking.service;

import com.banking.entity.LoginFeatures;
import com.banking.entity.MFAFeatures;
import com.banking.entity.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import java.util.Base64;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@Service
public class EventStreamsService {

    private static final Logger logger = Logger.getLogger(EventStreamsService.class.getName());
    private final ObjectMapper mapper = new ObjectMapper();

    private final RestTemplate restTemplate;
    private final LoginFeaturesService loginFeaturesService;
    private final MFAFeaturesService mfaFeaturesService;
    private final FeaturePreparationService featurePreparationService;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Value("${eventstreams.enabled:false}")
    private boolean enabled;

    @Value("${eventstreams.url:}")
    private String baseUrl;

    @Value("${eventstreams.namespace:}")
    private String namespace;

    @Value("${eventstreams.instance:}")
    private String instance;

    @Value("${eventstreams.topic:transaction-details}")
    private String topicName;

    @Value("${eventstreams.username:}")
    private String username;

    @Value("${eventstreams.password:}")
    private String password;

    @Value("${event.streams.topic.anomaly:anomalies}")
    private String anomalyTopic;

    @Value("${event.streams.topic.success:successes}")
    private String successTopic;

    public EventStreamsService(
        @Qualifier("eventStreamsRestTemplate") RestTemplate restTemplate,
        LoginFeaturesService loginFeaturesService,
        MFAFeaturesService mfaFeaturesService,
        FeaturePreparationService featurePreparationService
    ) {
        this.restTemplate = restTemplate;
        this.loginFeaturesService = loginFeaturesService;
        this.mfaFeaturesService = mfaFeaturesService;
        this.featurePreparationService = featurePreparationService;
    }

    public void sendTransactionDetails(Transaction tx) {
        if (!enabled || baseUrl == null || baseUrl.isBlank()) {
            return;
        }

        try {
            String url = String.format("%s/topics/%s/records", baseUrl, topicName);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (username != null && !username.isBlank()) {
                String basic = Base64.getEncoder().encodeToString((username + ":" + (password != null ? password : "")).getBytes());
                headers.set("Authorization", "Basic " + basic);
            }

            // Fetch login and MFA features
            LoginFeatures login = loginFeaturesService.getLatestLoginFeatures(tx.getUserId()).orElse(null);
            MFAFeatures mfa = mfaFeaturesService.getLatestMFAFeatures(tx.getUserId()).orElse(null);

            // Use LinkedHashMap to preserve field order - matching dataset column order exactly
            Map<String, Object> value = new LinkedHashMap<>();
            
            // Dataset column order:
            // user_id, session_id, timestamp, country, city, prev_country, ip_address, isp,
            // is_vpn, is_tor, is_proxy, is_datacenter_ip, ip_reputation_score, device_fingerprint, device_type,
            // time_since_last_login_hours, distance_from_last_login_km, login_attempts, failed_attempts,
            // password_correct, time_to_login_seconds, is_breached_credential, mfa_required, mfa_method,
            // mfa_attempts, mfa_success, mfa_time_taken_seconds, mfa_method_changed, push_notification_count,
            // hour_of_day, day_of_week, is_weekend, is_unusual_time, typing_speed_chars_per_min,
            // mouse_movement_entropy, concurrent_sessions, session_duration_last_minutes, velocity_score,
            // device_trust_score, location_trust_score, risk_score
            
            value.put("user_id", tx.getUserId());
            value.put("session_id", login != null ? login.getSessionId() : null);
            value.put("timestamp", tx.getTimestamp() != null ? tx.getTimestamp().toString() : null);
            value.put("country", login != null ? login.getCountry() : null);
            value.put("city", login != null ? login.getCity() : null);
            value.put("prev_country", login != null ? login.getPreviousCountry() : null);
            value.put("ip_address", login != null ? login.getIpAddress() : null);
            value.put("isp", login != null ? login.getIsp() : null);
            value.put("is_vpn", login != null ? login.getIsVpn() : null);
            value.put("is_tor", login != null ? login.getIsTor() : null);
            value.put("is_proxy", login != null ? login.getIsProxy() : null);
            value.put("is_datacenter_ip", login != null ? login.getIsDatacenterIp() : null);
            value.put("ip_reputation_score", calculateIpReputationScore(login));
            value.put("device_fingerprint", login != null ? login.getDeviceFingerprint() : null);
            value.put("device_type", login != null ? login.getDeviceType() : null);
            value.put("time_since_last_login_hours", 0.0); // Calculated field - placeholder
            value.put("distance_from_last_login_km", 0.0); // Calculated field - placeholder
            value.put("login_attempts", login != null ? login.getLoginAttempts() : null);
            value.put("failed_attempts", login != null ? login.getFailedAttempts() : null);
            value.put("password_correct", login != null ? login.getPasswordCorrect() : null);
            value.put("time_to_login_seconds", login != null ? login.getTimeToLoginSeconds() : null);
            value.put("is_breached_credential", 0); // Placeholder - not tracked yet
            value.put("mfa_required", mfa != null ? mfa.getMfaRequired() : null);
            value.put("mfa_method", "email_otp"); // Default method
            value.put("mfa_attempts", mfa != null ? mfa.getMfaAttempts() : null);
            value.put("mfa_success", mfa != null ? mfa.getMfaSuccess() : null);
            value.put("mfa_time_taken_seconds", mfa != null ? mfa.getMfaTimeTakenSeconds() : null);
            value.put("mfa_method_changed", 0); // Placeholder - not tracked yet
            value.put("push_notification_count", 0); // Placeholder - not tracked yet
            value.put("hour_of_day", login != null ? login.getHourOfDay() : null);
            value.put("day_of_week", login != null ? login.getDayOfWeek() : null);
            value.put("is_weekend", login != null ? login.getIsWeekend() : null);
            value.put("is_unusual_time", login != null ? login.getIsUnusualTime() : null);
            value.put("typing_speed_chars_per_min", login != null ? login.getTypingSpeedCharsPerMin() : null);
            value.put("mouse_movement_entropy", login != null ? login.getMouseMovementEntropy() : null);
            value.put("concurrent_sessions", 1); // Placeholder - not tracked yet
            value.put("session_duration_last_minutes", calculateSessionDuration(login, mfa));
            value.put("velocity_score", calculateVelocityScore(login));
            value.put("device_trust_score", calculateDeviceTrustScore(login));
            value.put("location_trust_score", calculateLocationTrustScore(login));
            value.put("risk_score", calculateRiskScore(login));

            Map<String, Object> record = new LinkedHashMap<>();
            record.put("value", value);

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("records", List.of(record));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(url, entity, String.class);
        } catch (Exception ignored) {
            // Non-blocking: do not fail the main flow
        }
    }

    /**
     * Send encoded feature vector to Event Streams for model prediction via IBM ACE.
     * This method prepares the 41-feature vector with categorical encoding and sends it
     * to a separate topic for model prediction.
     */
    public void sendModelPredictionFeatures(Map<String, Object> rawData) {
        if (!enabled || baseUrl == null || baseUrl.isBlank()) {
            return;
        }

        try {
            // Use a dedicated topic for model input
            String modelTopic = "model-features-input";
            String url = String.format("%s/topics/%s/records", baseUrl, modelTopic);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (username != null && !username.isBlank()) {
                String basic = Base64.getEncoder().encodeToString((username + ":" + (password != null ? password : "")).getBytes());
                headers.set("Authorization", "Basic " + basic);
            }

            // Prepare the 41-feature vector with encoding
            double[] featureVector = featurePreparationService.prepareFeatureVector(rawData);
            
            // Convert feature vector to JSON-serializable format
            List<Double> features = new java.util.ArrayList<>();
            for (double val : featureVector) {
                features.add(val);
            }

            // Create payload for model prediction
            Map<String, Object> modelPayload = new LinkedHashMap<>();
            modelPayload.put("user_id", rawData.get("user_id"));
            modelPayload.put("session_id", rawData.get("session_id"));
            modelPayload.put("timestamp", rawData.get("timestamp"));
            modelPayload.put("features", features);  // 41-element array
            modelPayload.put("feature_count", features.size());
            modelPayload.put("note", "41-feature vector for hybrid model (anomaly_category_encoded excluded)");

            Map<String, Object> record = new LinkedHashMap<>();
            record.put("value", modelPayload);

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("records", List.of(record));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(url, entity, String.class);
            
            System.out.println("✅ Sent 41-feature vector for user: " + rawData.get("user_id"));
            
        } catch (Exception e) {
            // Non-blocking: log but don't fail the main flow
            System.err.println("⚠️  Error sending model features to Event Streams: " + e.getMessage());
        }
    }
    
    private Integer calculateIpReputationScore(LoginFeatures login) {
        if (login == null) return null;
        int score = 100;
        if (login.getIsVpn() != null && login.getIsVpn() == 1) score -= 30;
        if (login.getIsProxy() != null && login.getIsProxy() == 1) score -= 20;
        if (login.getIsDatacenterIp() != null && login.getIsDatacenterIp() == 1) score -= 25;
        String isp = login.getIsp();
        if (isp != null && isp.matches("(?i).*(aws|amazon|gcp|google|azure|cloudflare).*")) score -= 10;
        return Math.max(0, Math.min(100, score));
    }
    
    private Double calculateSessionDuration(LoginFeatures login, MFAFeatures mfa) {
        if (login == null || mfa == null) return null;
        Double loginTime = login.getTimeToLoginSeconds();
        Double mfaTime = mfa.getMfaTimeTakenSeconds();
        if (loginTime == null || mfaTime == null) return null;
        return (loginTime + mfaTime) / 60.0; // Convert to minutes
    }
    
    private Integer calculateVelocityScore(LoginFeatures login) {
        if (login == null) return null;
        int velocity = 50;
        if (login.getFailedAttempts() != null) {
            velocity += Math.min(40, login.getFailedAttempts() * 5);
        }
        if (login.getTypingSpeedCharsPerMin() != null) {
            velocity += Math.min(10, Math.max(0, (int)((30 - login.getTypingSpeedCharsPerMin()) / 3)));
        }
        return Math.max(0, Math.min(100, velocity));
    }
    
    private Integer calculateDeviceTrustScore(LoginFeatures login) {
        if (login == null) return null;
        int trust = 100;
        if (login.getIsDatacenterIp() != null && login.getIsDatacenterIp() == 1) trust -= 50;
        if (login.getIsProxy() != null && login.getIsProxy() == 1) trust -= 20;
        if (login.getIsVpn() != null && login.getIsVpn() == 1) trust -= 20;
        return Math.max(0, Math.min(100, trust));
    }
    
    private Integer calculateLocationTrustScore(LoginFeatures login) {
        if (login == null) return null;
        int trust = 100;
        if (login.getIsUnusualTime() != null && login.getIsUnusualTime() == 1) trust -= 30;
        if (login.getIsWeekend() != null && login.getIsWeekend() == 1) trust -= 10;
        String country = login.getCountry();
        String prevCountry = login.getPreviousCountry();
        if (country != null && prevCountry != null && !country.equals(prevCountry)) trust -= 30;
        return Math.max(0, Math.min(100, trust));
    }
    
    private Integer calculateRiskScore(LoginFeatures login) {
        if (login == null) return null;
        Integer deviceTrust = calculateDeviceTrustScore(login);
        Integer locationTrust = calculateLocationTrustScore(login);
        Integer ipScore = calculateIpReputationScore(login);
        Integer velocity = calculateVelocityScore(login);
        
        if (deviceTrust == null || locationTrust == null || ipScore == null || velocity == null) return null;
        
        return Math.max(0, Math.min(100, (int)Math.round(
            (100 - deviceTrust) * 0.35 +
            (100 - locationTrust) * 0.25 +
            (100 - ipScore) * 0.25 +
            velocity * 0.15
        )));
    }

    /**
     * Sends anomaly result to appropriate Event Streams topic
     */
    public void sendAnomalyResult(Map<String, Object> result) {
        if (!enabled || kafkaTemplate == null) {
            return;
        }
        try {
            int isAnomaly = (int) result.getOrDefault("is_anomaly", -1);
            String topic = (isAnomaly == 1) ? anomalyTopic : successTopic;
            String message = mapper.writeValueAsString(result);
            kafkaTemplate.send(topic, message);
        } catch (Exception e) {
            logger.severe("Failed to send anomaly result: " + e.getMessage());
        }
    }

    /**
     * Sends batch predictions to Event Streams
     */
    public void sendBatchPredictions(List<Map<String, Object>> predictions) {
        if (!enabled || kafkaTemplate == null) {
            return;
        }
        try {
            for (Map<String, Object> prediction : predictions) {
                sendAnomalyResult(prediction);
            }
        } catch (Exception e) {
            logger.severe("Failed to send batch predictions: " + e.getMessage());
        }
    }
}

