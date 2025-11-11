package com.banking.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

/**
 * EncodingService handles categorical feature encoding for ML model predictions.
 * 
 * The hybrid model expects integer-encoded categorical features:
 * - country_encoded
 * - city_encoded
 * - prev_country_encoded
 * - isp_encoded
 * - device_type_encoded
 * - mfa_method_encoded
 * 
 * This service maintains LabelEncoder-like mappings and applies them before
 * sending data to IBM ACE/Watsonx AI for prediction.
 */
@Service
public class EncodingService {

    // Maps for each categorical feature
    // Key: original value, Value: encoded integer
    private Map<String, Integer> countryEncoding = new LinkedHashMap<>();
    private Map<String, Integer> cityEncoding = new LinkedHashMap<>();
    private Map<String, Integer> prevCountryEncoding = new LinkedHashMap<>();
    private Map<String, Integer> ispEncoding = new LinkedHashMap<>();
    private Map<String, Integer> deviceTypeEncoding = new LinkedHashMap<>();
    private Map<String, Integer> mfaMethodEncoding = new LinkedHashMap<>();

    // Reverse maps for decoding (optional)
    private Map<Integer, String> countryDecoding = new LinkedHashMap<>();
    private Map<Integer, String> cityDecoding = new LinkedHashMap<>();
    private Map<Integer, String> ispDecoding = new LinkedHashMap<>();
    private Map<Integer, String> deviceTypeDecoding = new LinkedHashMap<>();
    private Map<Integer, String> mfaMethodDecoding = new LinkedHashMap<>();

    @Value("${encoding.csv-path:banking_authentication_anomalies.csv}")
    private String csvPath;

    public EncodingService() {
        initializeDefaultEncodings();
    }

    /**
     * Initialize default encodings based on known values from training data.
     * If CSV is available, this can be overridden with loadEncodingsFromCSV().
     */
    private void initializeDefaultEncodings() {
        // Countries - typically alphabetically ordered by LabelEncoder
        addCountryEncoding("Afghanistan", 0);
        addCountryEncoding("Albania", 1);
        addCountryEncoding("Algeria", 2);
        // ... add all countries from your dataset
        addCountryEncoding("USA", 207);
        addCountryEncoding("UK", 208);
        addCountryEncoding("India", 101);
        // Note: These are example values. Use actual CSV to generate accurate mappings.

        // ISPs
        addISPEncoding("Airtel", 0);
        addISPEncoding("AT&T", 1);
        addISPEncoding("AWS", 2);
        addISPEncoding("Azure", 3);
        addISPEncoding("Comcast", 4);
        addISPEncoding("GCP", 5);

        // Device Types
        addDeviceTypeEncoding("Android-Chrome", 0);
        addDeviceTypeEncoding("iOS-Safari", 1);
        addDeviceTypeEncoding("Mac-Safari", 2);
        addDeviceTypeEncoding("Windows-Edge", 3);

        // MFA Methods
        addMFAMethodEncoding("Authenticator_App", 0);
        addMFAMethodEncoding("Push_Notification", 1);
        addMFAMethodEncoding("SMS", 2);
    }

    /**
     * Load encodings from the training CSV file to ensure consistency.
     * This method scans the CSV and builds encoder maps from actual data.
     */
    public void loadEncodingsFromCSV() {
        try {
            List<String> lines = Files.readAllLines(Paths.get(csvPath), StandardCharsets.UTF_8);
            if (lines.isEmpty()) return;

            // Parse header
            String[] header = lines.get(0).split(",");
            Map<String, Integer> columnIndex = new HashMap<>();
            for (int i = 0; i < header.length; i++) {
                columnIndex.put(header[i].trim(), i);
            }

            // Track unique values for each categorical column
            Set<String> uniqueCountries = new LinkedHashSet<>();
            Set<String> uniqueCities = new LinkedHashSet<>();
            Set<String> uniquePrevCountries = new LinkedHashSet<>();
            Set<String> uniqueISPs = new LinkedHashSet<>();
            Set<String> uniqueDeviceTypes = new LinkedHashSet<>();
            Set<String> uniqueMFAMethods = new LinkedHashSet<>();

            // Read CSV and collect unique values
            for (int i = 1; i < lines.size(); i++) {
                String[] values = lines.get(i).split(",");
                
                if (columnIndex.containsKey("country") && values.length > columnIndex.get("country")) {
                    uniqueCountries.add(values[columnIndex.get("country")].trim());
                }
                if (columnIndex.containsKey("city") && values.length > columnIndex.get("city")) {
                    uniqueCities.add(values[columnIndex.get("city")].trim());
                }
                if (columnIndex.containsKey("prev_country") && values.length > columnIndex.get("prev_country")) {
                    uniquePrevCountries.add(values[columnIndex.get("prev_country")].trim());
                }
                if (columnIndex.containsKey("isp") && values.length > columnIndex.get("isp")) {
                    uniqueISPs.add(values[columnIndex.get("isp")].trim());
                }
                if (columnIndex.containsKey("device_type") && values.length > columnIndex.get("device_type")) {
                    uniqueDeviceTypes.add(values[columnIndex.get("device_type")].trim());
                }
                if (columnIndex.containsKey("mfa_method") && values.length > columnIndex.get("mfa_method")) {
                    uniqueMFAMethods.add(values[columnIndex.get("mfa_method")].trim());
                }
            }

            // Build encoder maps from unique values (maintains order)
            int index = 0;
            for (String country : uniqueCountries) {
                addCountryEncoding(country, index++);
            }

            index = 0;
            for (String city : uniqueCities) {
                addCityEncoding(city, index++);
            }

            index = 0;
            for (String prevCountry : uniquePrevCountries) {
                addPrevCountryEncoding(prevCountry, index++);
            }

            index = 0;
            for (String isp : uniqueISPs) {
                addISPEncoding(isp, index++);
            }

            index = 0;
            for (String deviceType : uniqueDeviceTypes) {
                addDeviceTypeEncoding(deviceType, index++);
            }

            index = 0;
            for (String mfaMethod : uniqueMFAMethods) {
                addMFAMethodEncoding(mfaMethod, index++);
            }

            System.out.println("✅ Encodings loaded from CSV: " + csvPath);

        } catch (IOException e) {
            System.err.println("⚠️  Could not load encodings from CSV: " + e.getMessage());
            System.out.println("   Using default encodings instead.");
        }
    }

    // ==================== Public Encoding Methods ====================

    /**
     * Encode a country value to integer.
     * Returns -1 if the country is unknown.
     */
    public int encodeCountry(String country) {
        return countryEncoding.getOrDefault(country, -1);
    }

    /**
     * Encode a city value to integer.
     * Returns -1 if the city is unknown.
     */
    public int encodeCity(String city) {
        return cityEncoding.getOrDefault(city, -1);
    }

    /**
     * Encode a previous country value to integer.
     */
    public int encodePrevCountry(String prevCountry) {
        return prevCountryEncoding.getOrDefault(prevCountry, -1);
    }

    /**
     * Encode an ISP value to integer.
     */
    public int encodeISP(String isp) {
        return ispEncoding.getOrDefault(isp, -1);
    }

    /**
     * Encode a device type value to integer.
     */
    public int encodeDeviceType(String deviceType) {
        return deviceTypeEncoding.getOrDefault(deviceType, -1);
    }

    /**
     * Encode an MFA method value to integer.
     */
    public int encodeMFAMethod(String mfaMethod) {
        return mfaMethodEncoding.getOrDefault(mfaMethod, -1);
    }

    // ==================== Decoding Methods (Optional) ====================

    public String decodeCountry(int encoded) {
        return countryDecoding.getOrDefault(encoded, "UNKNOWN");
    }

    public String decodeISP(int encoded) {
        return ispDecoding.getOrDefault(encoded, "UNKNOWN");
    }

    public String decodeDeviceType(int encoded) {
        return deviceTypeDecoding.getOrDefault(encoded, "UNKNOWN");
    }

    public String decodeMFAMethod(int encoded) {
        return mfaMethodDecoding.getOrDefault(encoded, "UNKNOWN");
    }

    // ==================== Helper Methods for Adding Encodings ====================

    private void addCountryEncoding(String country, int code) {
        countryEncoding.put(country, code);
        countryDecoding.put(code, country);
    }

    private void addCityEncoding(String city, int code) {
        cityEncoding.put(city, code);
        cityDecoding.put(code, city);
    }

    private void addPrevCountryEncoding(String prevCountry, int code) {
        prevCountryEncoding.put(prevCountry, code);
    }

    private void addISPEncoding(String isp, int code) {
        ispEncoding.put(isp, code);
        ispDecoding.put(code, isp);
    }

    private void addDeviceTypeEncoding(String deviceType, int code) {
        deviceTypeEncoding.put(deviceType, code);
        deviceTypeDecoding.put(code, deviceType);
    }

    private void addMFAMethodEncoding(String mfaMethod, int code) {
        mfaMethodEncoding.put(mfaMethod, code);
        mfaMethodDecoding.put(code, mfaMethod);
    }

    // ==================== Getters ====================

    public Map<String, Integer> getCountryEncoding() {
        return new HashMap<>(countryEncoding);
    }

    public Map<String, Integer> getISPEncoding() {
        return new HashMap<>(ispEncoding);
    }

    public Map<String, Integer> getDeviceTypeEncoding() {
        return new HashMap<>(deviceTypeEncoding);
    }

    public Map<String, Integer> getMFAMethodEncoding() {
        return new HashMap<>(mfaMethodEncoding);
    }

    /**
     * Get statistics about the encodings.
     */
    public Map<String, Object> getEncodingStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("countries", countryEncoding.size());
        stats.put("cities", cityEncoding.size());
        stats.put("isps", ispEncoding.size());
        stats.put("deviceTypes", deviceTypeEncoding.size());
        stats.put("mfaMethods", mfaMethodEncoding.size());
        stats.put("totalCategorical", 
                 countryEncoding.size() + ispEncoding.size() + 
                 deviceTypeEncoding.size() + mfaMethodEncoding.size());
        return stats;
    }
}
