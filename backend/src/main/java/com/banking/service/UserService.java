package com.banking.service;

import com.banking.entity.User;
import com.banking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
    
    public Optional<User> findByEmailOrPhone(String emailOrPhone) {
        Optional<User> byEmail = userRepository.findByEmail(emailOrPhone);
        if (byEmail.isPresent()) {
            return byEmail;
        }
        return userRepository.findByPhoneNumber(emailOrPhone);
    }
    
    public Optional<User> findById(String userId) {
        return userRepository.findById(userId);
    }
    
    public User updateUser(User user) {
        return userRepository.save(user);
    }
    
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    public boolean existsByPhoneNumber(String phoneNumber) {
        return userRepository.existsByPhoneNumber(phoneNumber);
    }
    
    public User findByEmailAndPhoneNumber(String email, String phoneNumber) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent() && user.get().getPhoneNumber().equals(phoneNumber)) {
            return user.get();
        }
        return null;
    }
    
    public void updatePassword(String userId, String newPassword) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
        }
    }
}


