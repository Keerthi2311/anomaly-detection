package com.banking.controller;

import com.banking.dto.AuthResponse;
import com.banking.dto.LoginRequest;
import com.banking.entity.User;
import com.banking.service.AuthService;
import com.banking.service.UserService;
import com.banking.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private AccountService accountService;
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new AuthResponse(null, null, null, null, "Invalid credentials"));
        }
    }
    
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody User user) {
        try {
            if (userService.existsByEmail(user.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, null, null, null, "Email already exists"));
            }
            if (userService.existsByPhoneNumber(user.getPhoneNumber())) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, null, null, null, "Phone number already exists"));
            }
            
            String originalPassword = user.getPassword();
            User savedUser = userService.createUser(user);
            
            // Create account for the user with default values
            var account = accountService.createAccount(
                savedUser.getUserId(), 
                "SAVINGS", 
                "USD",
                savedUser.getFirstName(),
                savedUser.getLastName()
            );
            
            LoginRequest loginReq = new LoginRequest();
            loginReq.setEmailOrPhone(user.getEmail());
            loginReq.setPassword(originalPassword);
            String token = authService.login(loginReq).getToken();
            
            return ResponseEntity.ok(new AuthResponse(token, savedUser.getUserId(), 
                savedUser.getEmail(), account.getAccountNumber(), "User created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new AuthResponse(null, null, null, null, "Error creating user: " + e.getMessage()));
        }
    }
    
    @Autowired
    private com.banking.service.PasswordResetService passwordResetService;
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        try {
            String email = request.get("email");
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(java.util.Map.of("message", "Email is required"));
            }
            
            // Create token and return it for frontend to send email via EmailJS
            java.util.Map<String, String> tokenData = passwordResetService.createPasswordResetToken(email);
            
            return ResponseEntity.ok(tokenData);
        } catch (Exception e) {
            // Don't reveal if email exists or not for security
            return ResponseEntity.badRequest()
                .body(java.util.Map.of("message", "User not found with this email"));
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> request) {
        try {
            String token = request.get("token");
            String newPassword = request.get("newPassword");
            
            if (token == null || newPassword == null) {
                return ResponseEntity.badRequest()
                    .body(java.util.Map.of("message", "Token and new password are required"));
            }
            
            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest()
                    .body(java.util.Map.of("message", "Password must be at least 6 characters"));
            }
            
            // Validate token and reset password
            passwordResetService.resetPassword(token, newPassword);
            
            return ResponseEntity.ok(java.util.Map.of("message", "Password reset successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(java.util.Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        try {
            boolean isValid = passwordResetService.validateToken(token);
            return ResponseEntity.ok(java.util.Map.of("valid", isValid));
        } catch (Exception e) {
            return ResponseEntity.ok(java.util.Map.of("valid", false));
        }
    }
}

