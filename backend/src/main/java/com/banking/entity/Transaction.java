package com.banking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false, name = "account_id")
    private String accountId;

    @Column(nullable = false, name = "user_id")
    private String userId;
    
    @Column(nullable = false, name = "timestamp")
    private LocalDateTime timestamp;
    
    @Column(nullable = false, name = "transaction_type")
    private String transactionType; // credit or debit
    
    @Column(name = "merchant_name")
    private String merchantName;
    
    @Transient
    private String merchantCategory; // no longer stored in DB
    
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;
    
    @Column(name = "currency")
    private String currency;
    
    @Column(name = "device_id")
    private String deviceId;
    
    @Column(name = "transaction_country")
    private String transactionCountry;
    
    @Column(name = "transaction_city")
    private String transactionCity;
    
    @Column(name = "channel") // web, app, ATM, POS
    private String channel;
    
    @Column(name = "status") // success, failed, pending
    private String status;
    
    @Column(name = "balance_after", precision = 19, scale = 2)
    private BigDecimal balanceAfter;
    
    @Transient
    private Boolean fraudFlag; // no longer stored in DB
    
    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
    
    // Manual setter methods for Lombok compatibility
    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }
    
    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public void setBalanceAfter(BigDecimal balanceAfter) {
        this.balanceAfter = balanceAfter;
    }
    
    public void setMerchantName(String merchantName) {
        this.merchantName = merchantName;
    }
    
    public void setMerchantCategory(String merchantCategory) {
        this.merchantCategory = merchantCategory;
    }
    
    public void setChannel(String channel) {
        this.channel = channel;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public void setFraudFlag(Boolean fraudFlag) {
        this.fraudFlag = fraudFlag;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getStatus() {
        return status;
    }

    public String getMerchantName() {
        return merchantName;
    }

    public String getMerchantCategory() {
        return merchantCategory;
    }

    public String getChannel() {
        return channel;
    }

    public Boolean getFraudFlag() {
        return fraudFlag;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public String getTransactionCity() {
        return transactionCity;
    }

    public String getTransactionCountry() {
        return transactionCountry;
    }

    public String getCurrency() {
        return currency;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public void setTransactionCity(String transactionCity) {
        this.transactionCity = transactionCity;
    }

    public void setTransactionCountry(String transactionCountry) {
        this.transactionCountry = transactionCountry;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
