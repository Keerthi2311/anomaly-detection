package com.banking.controller;

import com.banking.entity.Transaction;
import com.banking.service.TransactionService;
import com.banking.service.AccountService;
import com.banking.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {
    
    @Autowired
    private TransactionService transactionService;
    
    @Autowired
    private AccountService accountService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @GetMapping
    public ResponseEntity<List<Transaction>> getTransactions(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String userId = jwtUtil.extractClaim(jwt, claims -> claims.get("userId", String.class));
            return ResponseEntity.ok(transactionService.getTransactionsByUserId(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestHeader("Authorization") String token,
                                                         @RequestBody Transaction transaction) {
        try {
            String jwt = token.substring(7);
            String userId = jwtUtil.extractClaim(jwt, claims -> claims.get("userId", String.class));
            // Get account for user and set accountId
            var account = accountService.findByUserId(userId);
            if (account.isPresent()) {
                String accountId = account.get().getAccountId();
                return ResponseEntity.ok(transactionService.createAndSaveTransaction(accountId, transaction));
            }
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}


