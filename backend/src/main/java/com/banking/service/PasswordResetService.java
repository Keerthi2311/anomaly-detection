package com.banking.service;

import com.banking.entity.PasswordResetToken;
import com.banking.entity.User;
import com.banking.repository.PasswordResetTokenRepository;
import com.banking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {
    
    @Autowired
    private PasswordResetTokenRepository tokenRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserService userService;
    
    private static final int EXPIRATION_HOURS = 1; // Token valid for 1 hour
    
    @Transactional
    public java.util.Map<String, String> createPasswordResetToken(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("No user found with email: " + email);
        }
        
        User user = userOpt.get();
        
        // Delete any existing tokens for this user
        tokenRepository.deleteByUserId(user.getUserId());
        
        // Generate new token
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(EXPIRATION_HOURS);
        
        PasswordResetToken resetToken = new PasswordResetToken(
            token,
            user.getUserId(),
            user.getEmail(),
            expiryDate
        );
        
        tokenRepository.save(resetToken);
        
        // Return token and user info for frontend to send email via EmailJS
        return java.util.Map.of(
            "token", token,
            "userName", user.getFirstName() != null ? user.getFirstName() : "User",
            "email", user.getEmail()
        );
    }
    
    @Transactional
    public boolean validateToken(String token) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);
        if (tokenOpt.isEmpty()) {
            return false;
        }
        
        PasswordResetToken resetToken = tokenOpt.get();
        return !resetToken.isUsed() && !resetToken.isExpired();
    }
    
    @Transactional
    public void resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);
        if (tokenOpt.isEmpty()) {
            throw new RuntimeException("Invalid token");
        }
        
        PasswordResetToken resetToken = tokenOpt.get();
        
        if (resetToken.isUsed()) {
            throw new RuntimeException("Token has already been used");
        }
        
        if (resetToken.isExpired()) {
            throw new RuntimeException("Token has expired");
        }
        
        // Update password
        userService.updatePassword(resetToken.getUserId(), newPassword);
        
        // Mark token as used
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
}
