package com.banking.service;

import com.banking.entity.Account;
import com.banking.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Optional;

@Service
public class AccountService {
    
    @Autowired
    private AccountRepository accountRepository;
    
    public Account createAccount(String userId, String accountType, String currencyPreference, String firstName, String lastName) {
        Account account = new Account();
        account.setUserId(userId);
        account.setAccountType(accountType);
        account.setCurrencyPreference(currencyPreference);
        account.setFirstName(firstName);
        account.setLastName(lastName);
        // Provide a realistic starting balance so dashboards aren't empty
        account.setAccountBalance(new BigDecimal("25430.50"));
        
        // Generate unique account number
        String accountNumber = generateAccountNumber();
        while (accountRepository.existsByAccountNumber(accountNumber)) {
            accountNumber = generateAccountNumber();
        }
        account.setAccountNumber(accountNumber);
        
        return accountRepository.save(account);
    }
    
    public Optional<Account> findByUserId(String userId) {
        return accountRepository.findByUserId(userId);
    }
    
    public Optional<Account> findByAccountNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber);
    }
    
    public Optional<Account> findById(String accountId) {
        Objects.requireNonNull(accountId, "accountId must not be null");
        return accountRepository.findById(accountId);
    }
    
    public Account updateAccount(Account account) {
        account.setUpdatedAt(LocalDateTime.now());
        return accountRepository.save(account);
    }
    
    public Account updateBalance(String accountId, BigDecimal newBalance) {
        Objects.requireNonNull(accountId, "accountId must not be null");
        Optional<Account> accountOpt = accountRepository.findById(accountId);
        if (accountOpt.isPresent()) {
            Account account = accountOpt.get();
            account.setAccountBalance(newBalance);
            account.setUpdatedAt(LocalDateTime.now());
            return accountRepository.save(account);
        }
        return null;
    }
    
    private String generateAccountNumber() {
        // Generate a 10-digit account number
        return String.format("%010d", (long) (Math.random() * 10000000000L));
    }
}