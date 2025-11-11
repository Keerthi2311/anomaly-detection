package com.banking.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.banking.service.ModelInferenceService;
import com.banking.service.EventStreamsService;
import java.util.*;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/predictions")
public class PredictionController {

    private static final Logger logger = Logger.getLogger(PredictionController.class.getName());

    @Autowired
    private ModelInferenceService modelInferenceService;

    @Autowired
    private EventStreamsService eventStreamsService;

    /**
     * Single prediction endpoint
     */
    @PostMapping("/single")
    public ResponseEntity<Map<String, Object>> predictSingle(@RequestBody Map<String, Object> transactionData) {
        try {
            logger.info("Received prediction request for transaction: " + transactionData.get("transaction_id"));

            Map<String, Object> prediction = modelInferenceService.predictAnomaly(transactionData);

            // Send result to Event Streams
            eventStreamsService.sendAnomalyResult(prediction);

            return ResponseEntity.ok(prediction);

        } catch (Exception e) {
            logger.severe("Prediction failed: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("status", "FAILED");
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Batch prediction endpoint
     */
    @PostMapping("/batch")
    public ResponseEntity<Map<String, Object>> predictBatch(@RequestBody List<Map<String, Object>> transactions) {
        try {
            logger.info("Received batch prediction request for " + transactions.size() + " transactions");

            List<Map<String, Object>> predictions = new ArrayList<>();
            for (Map<String, Object> transaction : transactions) {
                Map<String, Object> prediction = modelInferenceService.predictAnomaly(transaction);
                predictions.add(prediction);
            }

            // Send results to Event Streams
            eventStreamsService.sendBatchPredictions(predictions);

            Map<String, Object> response = new HashMap<>();
            response.put("total_transactions", transactions.size());
            response.put("predictions", predictions);
            response.put("anomaly_count", predictions.stream()
                .filter(p -> (int) p.getOrDefault("is_anomaly", 0) == 1)
                .count());
            response.put("normal_count", predictions.stream()
                .filter(p -> (int) p.getOrDefault("is_anomaly", 0) == 0)
                .count());
            response.put("status", "SUCCESS");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.severe("Batch prediction failed: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("status", "FAILED");
            error.put("total_transactions", transactions.size());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Model Inference Service");
        response.put("version", "3.0.0");
        response.put("feature_count", 41);
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}
