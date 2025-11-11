package com.banking.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    public void sendPasswordResetEmail(String toEmail, String resetLink, String firstName) {
        // For development, we'll just log the email
        // In production, you would use JavaMailSender or an email service like SendGrid
        
        System.out.println("=".repeat(80));
        System.out.println("PASSWORD RESET EMAIL");
        System.out.println("=".repeat(80));
        System.out.println("To: " + toEmail);
        System.out.println("Subject: Reset Your Password");
        System.out.println();
        System.out.println("Hi " + firstName + ",");
        System.out.println();
        System.out.println("You requested to reset your password. Click the link below to reset it:");
        System.out.println();
        System.out.println(resetLink);
        System.out.println();
        System.out.println("This link will expire in 1 hour.");
        System.out.println();
        System.out.println("If you didn't request this, please ignore this email.");
        System.out.println();
        System.out.println("Thanks,");
        System.out.println("Banking System Team");
        System.out.println("=".repeat(80));
    }
    
    public void sendOtpEmail(String toEmail, String otp) {
        // Existing OTP email functionality
        System.out.println("=".repeat(80));
        System.out.println("OTP EMAIL");
        System.out.println("=".repeat(80));
        System.out.println("To: " + toEmail);
        System.out.println("Subject: Your OTP Code");
        System.out.println();
        System.out.println("Your OTP code is: " + otp);
        System.out.println();
        System.out.println("This code will expire in 5 minutes.");
        System.out.println("=".repeat(80));
    }
}
