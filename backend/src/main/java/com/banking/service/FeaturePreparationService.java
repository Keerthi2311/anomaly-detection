package com.banking.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

/**
 * FeaturePreparationService prepares feature vectors for ML model prediction.
 * 
 * Transforms raw transaction/login data into the 41-feature vector expected by
 * the hybrid model. Features are prepared in the exact order the model expects.
 */
@Service
public class FeaturePreparationService {

    @Autowired(required = false)
    private EncodingService encodingService;

    // High-risk countries for feature engineering
    private static final Set<String> HIGH_RISK_COUNTRIES = new HashSet<>(
        Arrays.asList("North Korea", "Iran", "Syria", "Russia", "Nigeria")
    );

    // Datacenter ISPs for feature engineering
    private static final Set<String> DATACENTER_ISPS = new HashSet<>(
        Arrays.asList("AWS", "Azure", "GCP")
    );

    /**
     * Build a feature vector from login/transaction data.
     * Returns a double[] array with exactly 41 features in the required order.
     * 
     * Feature Order:
     * 0-35: Numeric features
     * 36-40: Encoded categorical features (country, city, prev_country, isp, device_type, mfa_method)
     * 
     * NOTE: anomaly_category_encoded is EXCLUDED from the feature vector
     */
    public double[] prepareFeatureVector(Map<String, Object> data) {
        double[] features = new double[41];
        int index = 0;

        // ========== NUMERIC FEATURES (indices 0-35) ==========
        // These are sent as-is from the raw data

        // Basic flags
        features[index++] = getDoubleValue(data, "is_vpn", 0.0);
        features[index++] = getDoubleValue(data, "is_tor", 0.0);
        features[index++] = getDoubleValue(data, "is_proxy", 0.0);
        features[index++] = getDoubleValue(data, "is_datacenter_ip", 0.0);

        // IP reputation
        features[index++] = getDoubleValue(data, "ip_reputation_score", 0.5);

        // Login timing
        features[index++] = getDoubleValue(data, "time_since_last_login_hours", 0.0);
        features[index++] = getDoubleValue(data, "distance_from_last_login_km", 0.0);

        // Attempt counts
        features[index++] = getDoubleValue(data, "login_attempts", 1.0);
        features[index++] = getDoubleValue(data, "failed_attempts", 0.0);

        // Password
        features[index++] = getDoubleValue(data, "password_correct", 1.0);
        features[index++] = getDoubleValue(data, "time_to_login_seconds", 30.0);

        // Breach status
        features[index++] = getDoubleValue(data, "is_breached_credential", 0.0);

        // MFA
        features[index++] = getDoubleValue(data, "mfa_required", 1.0);
        features[index++] = getDoubleValue(data, "mfa_attempts", 1.0);
        features[index++] = getDoubleValue(data, "mfa_success", 1.0);
        features[index++] = getDoubleValue(data, "mfa_time_taken_seconds", 5.0);
        features[index++] = getDoubleValue(data, "mfa_method_changed", 0.0);

        // Push notifications
        features[index++] = getDoubleValue(data, "push_notification_count", 0.0);

        // Time of day (from raw timestamp)
        LocalDateTime timestamp = getTimestamp(data);
        features[index++] = timestamp.getHour();  // hour_of_day
        features[index++] = timestamp.getDayOfWeek().getValue() - 1;  // day_of_week (0=Monday)

        // Weekend flag
        int dayOfWeek = timestamp.getDayOfWeek().getValue();
        features[index++] = (dayOfWeek == 6 || dayOfWeek == 7) ? 1.0 : 0.0;  // is_weekend

        // Unusual time flag
        int hour = timestamp.getHour();
        features[index++] = (hour < 6 || hour > 23) ? 1.0 : 0.0;  // is_unusual_time

        // Behavioral metrics
        features[index++] = getDoubleValue(data, "typing_speed_chars_per_min", 40.0);
        features[index++] = getDoubleValue(data, "mouse_movement_entropy", 0.5);

        // Session info
        features[index++] = getDoubleValue(data, "concurrent_sessions", 1.0);
        features[index++] = getDoubleValue(data, "session_duration_last_minutes", 30.0);

        // Risk scores
        features[index++] = getDoubleValue(data, "velocity_score", 0.0);
        features[index++] = getDoubleValue(data, "device_trust_score", 0.8);
        features[index++] = getDoubleValue(data, "location_trust_score", 0.8);

        // Derived time features from timestamp
        features[index++] = timestamp.getHour();  // login_hour
        features[index++] = timestamp.getDayOfMonth();  // login_day
        features[index++] = timestamp.getMonthValue();  // login_month
        features[index++] = timestamp.getDayOfWeek().getValue() - 1;  // login_weekday

        // High-risk country flag
        String country = getStringValue(data, "country", "");
        features[index++] = HIGH_RISK_COUNTRIES.contains(country) ? 1.0 : 0.0;

        // Datacenter ISP flag
        String isp = getStringValue(data, "isp", "");
        features[index++] = DATACENTER_ISPS.contains(isp) ? 1.0 : 0.0;

        // Suspicious timing flag (duplicate of is_unusual_time, but included per training data)
        features[index++] = (hour < 6 || hour > 23) ? 1.0 : 0.0;

        // ========== ENCODED CATEGORICAL FEATURES (indices 36-40) ==========
        // NOTE: WE EXCLUDE anomaly_category_encoded (would be index 41 if included)

        if (encodingService != null) {
            features[index++] = encodingService.encodeCountry(country);
            features[index++] = encodingService.encodeCity(getStringValue(data, "city", ""));
            features[index++] = encodingService.encodePrevCountry(getStringValue(data, "prev_country", ""));
            features[index++] = encodingService.encodeISP(isp);
            features[index++] = encodingService.encodeDeviceType(getStringValue(data, "device_type", ""));
            features[index++] = encodingService.encodeMFAMethod(getStringValue(data, "mfa_method", ""));
        } else {
            // If encoding service is not available, use default encoding (0)
            features[index++] = 0;  // country_encoded
            features[index++] = 0;  // city_encoded
            features[index++] = 0;  // prev_country_encoded
            features[index++] = 0;  // isp_encoded
            features[index++] = 0;  // device_type_encoded
            features[index++] = 0;  // mfa_method_encoded
        }

        // Verify we have exactly 41 features
        if (index != 41) {
            throw new IllegalStateException(
                String.format("Feature vector size mismatch: expected 41, got %d", index)
            );
        }

        return features;
    }

    /**
     * Get the feature column names in the exact order expected by the model.
     */
    public List<String> getFeatureNames() {
        return Arrays.asList(
            // Numeric features
            "is_vpn", "is_tor", "is_proxy", "is_datacenter_ip",
            "ip_reputation_score",
            "time_since_last_login_hours", "distance_from_last_login_km",
            "login_attempts", "failed_attempts", "password_correct", "time_to_login_seconds",
            "is_breached_credential",
            "mfa_required", "mfa_attempts", "mfa_success", "mfa_time_taken_seconds", "mfa_method_changed",
            "push_notification_count",
            "hour_of_day", "day_of_week", "is_weekend", "is_unusual_time",
            "typing_speed_chars_per_min", "mouse_movement_entropy",
            "concurrent_sessions", "session_duration_last_minutes",
            "velocity_score", "device_trust_score", "location_trust_score",
            "login_hour", "login_day", "login_month", "login_weekday",
            "high_risk_country", "datacenter_isp", "suspicious_timing",
            // Encoded categorical features
            "country_encoded", "city_encoded", "prev_country_encoded",
            "isp_encoded", "device_type_encoded", "mfa_method_encoded"
            // NOTE: anomaly_category_encoded is NOT included
        );
    }

    /**
     * Convert feature vector back to a map for debugging/logging.
     */
    public Map<String, Double> featureVectorToMap(double[] features) {
        List<String> names = getFeatureNames();
        Map<String, Double> result = new LinkedHashMap<>();
        for (int i = 0; i < Math.min(features.length, names.size()); i++) {
            result.put(names.get(i), features[i]);
        }
        return result;
    }

    // ==================== Helper Methods ====================

    private double getDoubleValue(Map<String, Object> data, String key, double defaultValue) {
        Object value = data.get(key);
        if (value == null) return defaultValue;
        if (value instanceof Number) return ((Number) value).doubleValue();
        try {
            return Double.parseDouble(value.toString());
        } catch (Exception e) {
            return defaultValue;
        }
    }

    private String getStringValue(Map<String, Object> data, String key, String defaultValue) {
        Object value = data.get(key);
        if (value == null) return defaultValue;
        return value.toString();
    }

    private LocalDateTime getTimestamp(Map<String, Object> data) {
        Object value = data.get("timestamp");
        if (value instanceof LocalDateTime) {
            return (LocalDateTime) value;
        }
        if (value instanceof String) {
            try {
                return LocalDateTime.parse((String) value);
            } catch (Exception e) {
                // Continue to default
            }
        }
        return LocalDateTime.now(ZoneId.of("UTC"));
    }
}
