package com.banking.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String userId;
    private String email;
    private String accountNumber;
    private String message;
    
    // Manual getter methods for Lombok compatibility
    public String getToken() {
        return token;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public String getEmail() {
        return email;
    }
    
    public String getAccountNumber() {
        return accountNumber;
    }
    
    public String getMessage() {
        return message;
    }
    
    // Manual constructor to match usage
    public AuthResponse(String token, String userId, String email, String accountNumber, String message) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.accountNumber = accountNumber;
        this.message = message;
    }
}


