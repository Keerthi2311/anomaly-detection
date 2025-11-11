package com.banking.service;

import com.banking.dto.AuthResponse;
import com.banking.dto.LoginRequest;
import com.banking.entity.User;
import com.banking.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private AccountService accountService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public AuthResponse login(LoginRequest request) {
        String rawIdentifier = request.getEmailOrPhone();
        String rawPassword = request.getPassword();
        
        String identifier = rawIdentifier != null ? rawIdentifier.trim() : "";
        String password = rawPassword != null ? rawPassword.trim() : "";
        
        User user = userService.findByEmailOrPhone(identifier)
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        String token = jwtUtil.generateToken(user.getEmail(), user.getUserId());
        
        // Ensure the user has an account; create a default one on-the-fly if missing
        var account = accountService.findByUserId(user.getUserId())
            .orElseGet(() -> accountService.createAccount(
                user.getUserId(),
                "SAVINGS",
                "USD",
                user.getFirstName(),
                user.getLastName()
            ));
        
        return new AuthResponse(token, user.getUserId(), user.getEmail(), account.getAccountNumber(), "Login successful");
    }
}


