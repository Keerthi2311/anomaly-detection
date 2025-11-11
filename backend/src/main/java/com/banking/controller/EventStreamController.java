package com.banking.controller;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/event-stream")
public class EventStreamController {

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/proxy")
    public ResponseEntity<String> proxyToEventStream(@RequestBody Map<String, Object> payload) {
        String eventStreamUrl = "https://es-banking-ibm-es-recapi-external-banking.apps.itz-q44c63.infra01-lb.tok04.techzone.ibm.com/topics/transaction-details/records";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.valueOf("application/vnd.kafka.json.v2+json"));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(eventStreamUrl, HttpMethod.POST, entity, String.class);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error proxying to event stream: " + e.getMessage());
        }
    }
}
