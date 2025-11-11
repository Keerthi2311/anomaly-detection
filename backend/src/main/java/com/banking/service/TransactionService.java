package com.banking.service;

import com.banking.entity.Transaction;
import com.banking.repository.TransactionRepository;
import com.banking.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private AccountService accountService;
    
    @Autowired(required = false)
    private EventStreamsService eventStreamsService;
    
    public Transaction createTransaction(Transaction transaction) {
        Transaction saved = transactionRepository.save(transaction);
        if (eventStreamsService != null) {
            eventStreamsService.sendTransactionDetails(saved);
        }
        return saved;
    }
    
    public List<Transaction> getTransactionsByUserId(String userId) {
        // First get the user's account
        var account = accountService.findByUserId(userId);
        if (account.isPresent()) {
            return transactionRepository.findByAccountIdOrderByTimestampDesc(account.get().getAccountId());
        }
        return List.of();
    }
    
    public List<Transaction> getTransactionsByUserIdAndType(String userId, String type) {
        // First get the user's account
        var account = accountService.findByUserId(userId);
        if (account.isPresent()) {
            return transactionRepository.findByAccountIdAndTransactionTypeOrderByTimestampDesc(account.get().getAccountId(), type);
        }
        return List.of();
    }
    
    public Transaction createTransactionWithAccount(String accountId, String transactionType, BigDecimal amount, 
                                       String merchantName, String merchantCategory, String channel) {
        
        // Get current account balance
        var account = accountService.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found"));
        
        BigDecimal balanceAfter = account.getAccountBalance();
        
        // Update balance based on transaction type
        if ("credit".equalsIgnoreCase(transactionType)) {
            balanceAfter = balanceAfter.add(amount);
        } else if ("debit".equalsIgnoreCase(transactionType)) {
            balanceAfter = balanceAfter.subtract(amount);
        }
        
        // Update account balance
        accountService.updateBalance(accountId, balanceAfter);
        
        // Create transaction
        Transaction transaction = new Transaction();
        transaction.setAccountId(accountId);
        transaction.setTransactionType(transactionType.toLowerCase());
        transaction.setAmount(amount);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setTimestamp(LocalDateTime.now());
        transaction.setStatus("success");
        transaction.setMerchantName(merchantName);
        transaction.setMerchantCategory(merchantCategory);
        transaction.setChannel(channel);
        transaction.setFraudFlag(false);
        
        return transactionRepository.save(transaction);
    }

    public Transaction createAndSaveTransaction(String accountId, Transaction request) {
        var account = accountService.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found"));

        BigDecimal current = account.getAccountBalance();
        BigDecimal delta = request.getAmount() != null ? request.getAmount() : BigDecimal.ZERO;
        String type = request.getTransactionType() != null ? request.getTransactionType().toLowerCase() : "debit";

        BigDecimal balanceAfter = current;
        if ("credit".equalsIgnoreCase(type)) {
            balanceAfter = current.add(delta);
        } else {
            balanceAfter = current.subtract(delta);
        }

        accountService.updateBalance(accountId, balanceAfter);

        Transaction tx = new Transaction();
        tx.setAccountId(accountId);
        tx.setUserId(account.getUserId());
        tx.setTransactionType(type);
        tx.setAmount(delta);
        tx.setBalanceAfter(balanceAfter);
        tx.setTimestamp(request.getTimestamp() != null ? request.getTimestamp() : LocalDateTime.now());
        tx.setStatus(request.getStatus() != null ? request.getStatus() : "success");
        tx.setMerchantName(request.getMerchantName());
        tx.setMerchantCategory(request.getMerchantCategory());
        tx.setChannel(request.getChannel());
        tx.setFraudFlag(request.getFraudFlag() != null ? request.getFraudFlag() : Boolean.FALSE);
        // optional fields
        tx.setDeviceId(request.getDeviceId());
        tx.setTransactionCity(request.getTransactionCity());
        tx.setTransactionCountry(request.getTransactionCountry());
        // currency kept as provided
        tx.setCurrency(request.getCurrency());

        Transaction saved = transactionRepository.save(tx);
        if (eventStreamsService != null) {
            eventStreamsService.sendTransactionDetails(saved);
        }
        return saved;
    }
}


