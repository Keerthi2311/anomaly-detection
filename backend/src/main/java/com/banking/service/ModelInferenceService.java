package com.banking.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;
import java.util.logging.Logger;

@Service
public class ModelInferenceService {

    private static final Logger logger = Logger.getLogger(ModelInferenceService.class.getName());

    @Autowired
    private FeaturePreparationService featurePreparationService;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${watsonx.model.endpoint:http://localhost:8080}")
    private String watsonxEndpoint;

    @Value("${watsonx.model.api-key:}")
    private String apiKey;

    @Value("${model.inference.feature-count:41}")
    private int expectedFeatureCount;

    /**
     * Main prediction method - orchestrates encoding, feature prep, and model call
     */
    public Map<String, Object> predictAnomaly(Map<String, Object> transactionData) {
        try {
            logger.info("Starting anomaly prediction for transaction: " + transactionData.get("transaction_id"));

            // Step 1: Prepare 41-feature vector (includes encoding)
            double[] features = featurePreparationService.prepareFeatureVector(transactionData);

            // Step 2: Validate feature count
            if (features.length != expectedFeatureCount) {
                throw new RuntimeException("Feature count mismatch: expected " + expectedFeatureCount + 
                    ", got " + features.length);
            }

            logger.info("Feature vector prepared: " + features.length + " features");

            // Step 3: Send to Watsonx model
            Map<String, Object> prediction = callWatsonxModel(features);

            // Step 4: Post-process result
            Map<String, Object> result = postProcessPrediction(prediction, transactionData);
            
            logger.info("Prediction complete: " + result.get("is_anomaly"));
            return result;

        } catch (Exception e) {
            logger.severe("Prediction failed: " + e.getMessage());
            return createErrorResponse(e.getMessage(), transactionData);
        }
    }

    /**
     * Calls Watsonx API with 41-feature array
     */
    private Map<String, Object> callWatsonxModel(double[] features) {
        try {
            logger.info("Calling Watsonx model with " + features.length + " features");
            
            Map<String, Object> request = new HashMap<>();
            request.put("input_data", new Object[]{ features });
            request.put("api_key", apiKey);

            String response = restTemplate.postForObject(
                watsonxEndpoint + "/predictions",
                request,
                String.class
            );

            ObjectMapper mapper = new ObjectMapper();
            @SuppressWarnings("unchecked")
            Map<String, Object> result = mapper.readValue(response, Map.class);
            
            logger.info("Watsonx response received");
            return result;

        } catch (Exception e) {
            logger.severe("Watsonx API call failed: " + e.getMessage());
            throw new RuntimeException("Watsonx API call failed: " + e.getMessage(), e);
        }
    }

    /**
     * Post-process model output and apply rules for category determination
     */
    private Map<String, Object> postProcessPrediction(Map<String, Object> prediction, 
                                                       Map<String, Object> transactionData) {
        Map<String, Object> result = new HashMap<>();
        
        // Extract prediction (0 or 1 from binary classifier)
        double anomalyScore = 0.0;
        if (prediction.containsKey("prediction")) {
            anomalyScore = ((Number) prediction.get("prediction")).doubleValue();
        }
        
        boolean isAnomaly = anomalyScore >= 0.5;

        result.put("transaction_id", transactionData.get("transaction_id"));
        result.put("is_anomaly", isAnomaly ? 1 : 0);
        result.put("anomaly_score", anomalyScore);
        result.put("confidence", prediction.getOrDefault("confidence", 0.0));
        result.put("timestamp", System.currentTimeMillis());
        result.put("model_version", "3.0.0");

        // Determine anomaly category based on backend rules
        if (isAnomaly) {
            String category = determineAnomalyCategory(transactionData, anomalyScore);
            result.put("anomaly_category", category);
        } else {
            result.put("anomaly_category", "NORMAL");
        }

        return result;
    }

    /**
     * Determines anomaly category using backend rules engine
     */
    private String determineAnomalyCategory(Map<String, Object> transactionData, double score) {
        try {
            // Rule 1: High-value transactions
            Object amountObj = transactionData.get("amount");
            if (amountObj != null) {
                double amount = ((Number) amountObj).doubleValue();
                if (amount > 10000 && score > 0.8) {
                    return "HIGH_VALUE_ANOMALY";
                }
            }

            // Rule 2: Location mismatch / Impossible travel
            Object velocityObj = transactionData.get("velocity_score");
            if (velocityObj != null) {
                double velocity = ((Number) velocityObj).doubleValue();
                if (velocity > 1000) {
                    return "IMPOSSIBLE_TRAVEL";
                }
            }

            // Rule 3: Brute force (failed attempts)
            Object failedAttemptsObj = transactionData.get("failed_attempts");
            if (failedAttemptsObj != null) {
                int failedAttempts = ((Number) failedAttemptsObj).intValue();
                if (failedAttempts >= 5) {
                    return "BRUTE_FORCE";
                }
            }

            // Rule 4: MFA fatigue
            Object pushNotificationsObj = transactionData.get("push_notification_count");
            if (pushNotificationsObj != null) {
                int pushNotifications = ((Number) pushNotificationsObj).intValue();
                if (pushNotifications >= 10) {
                    return "MFA_FATIGUE";
                }
            }

            // Rule 5: Unknown device
            Object deviceObj = transactionData.get("device_type");
            if (deviceObj != null && deviceObj.toString().equals("UNKNOWN")) {
                return "UNKNOWN_DEVICE";
            }

            // Default category
            return "SUSPICIOUS_PATTERN";

        } catch (Exception e) {
            logger.warning("Error in anomaly categorization: " + e.getMessage());
            return "CATEGORIZATION_ERROR";
        }
    }

    /**
     * Creates error response when prediction fails
     */
    private Map<String, Object> createErrorResponse(String errorMessage, Map<String, Object> transactionData) {
        Map<String, Object> response = new HashMap<>();
        response.put("transaction_id", transactionData.get("transaction_id"));
        response.put("is_anomaly", -1);
        response.put("error", errorMessage);
        response.put("timestamp", System.currentTimeMillis());
        response.put("status", "FAILED");
        return response;
    }
}
