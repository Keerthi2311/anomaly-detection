package com.banking.controller;

import com.banking.entity.User;
import com.banking.entity.Account;
import com.banking.service.UserService;
import com.banking.service.AccountService;
import com.banking.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private AccountService accountService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String userId = jwtUtil.extractClaim(jwt, claims -> claims.get("userId", String.class));
            return userService.findById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/me")
    public ResponseEntity<User> updateUser(@RequestHeader("Authorization") String token, 
                                           @RequestBody User user) {
        try {
            String jwt = token.substring(7);
            String userId = jwtUtil.extractClaim(jwt, claims -> claims.get("userId", String.class));
            user.setUserId(userId);
            return ResponseEntity.ok(userService.updateUser(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/me/account")
    public ResponseEntity<Account> getCurrentUserAccount(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String userId = jwtUtil.extractClaim(jwt, claims -> claims.get("userId", String.class));
            return accountService.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}


