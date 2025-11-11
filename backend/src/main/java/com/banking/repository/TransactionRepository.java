package com.banking.repository;

import com.banking.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    List<Transaction> findByAccountIdOrderByTimestampDesc(String accountId);
    List<Transaction> findByAccountIdAndTransactionTypeOrderByTimestampDesc(String accountId, String transactionType);
}


