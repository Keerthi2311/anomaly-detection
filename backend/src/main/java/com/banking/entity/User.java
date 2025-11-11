package com.banking.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String userId;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false, name = "first_name")
    private String firstName;
    
    @Column(nullable = false, name = "last_name")
    private String lastName;
    
    @Column(nullable = false, unique = true, name = "phone_number")
    private String phoneNumber;
    
    private String country;
    private String state;
    private String city;
    private String postalCode;
    private String occupation;
    private String incomeRange;
    private String preferredLanguage;
    
    @Column(name = "date_of_birth")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", shape = JsonFormat.Shape.STRING)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime dateOfBirth;
    
    private String gender;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "last_password_change")
    private LocalDateTime lastPasswordChange;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (lastPasswordChange == null) {
            lastPasswordChange = LocalDateTime.now();
        }
    }
    
    // Manual getters and setters to bypass Lombok issues
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    @JsonProperty("firstName")
    public String getFirstName() {
        return firstName;
    }
    
    @JsonProperty("firstName")
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    @JsonProperty("lastName")
    public String getLastName() {
        return lastName;
    }
    
    @JsonProperty("lastName")
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    @JsonProperty("postalCode")
    public String getPostalCode() {
        return postalCode;
    }
    
    @JsonProperty("postalCode")
    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }
    
    @JsonProperty("incomeRange")
    public String getIncomeRange() {
        return incomeRange;
    }
    
    @JsonProperty("incomeRange")
    public void setIncomeRange(String incomeRange) {
        this.incomeRange = incomeRange;
    }
    
    @JsonProperty("preferredLanguage")
    public String getPreferredLanguage() {
        return preferredLanguage;
    }
    
    @JsonProperty("preferredLanguage")
    public void setPreferredLanguage(String preferredLanguage) {
        this.preferredLanguage = preferredLanguage;
    }
    
    @JsonProperty("dateOfBirth")
    public LocalDateTime getDateOfBirth() {
        return dateOfBirth;
    }
    
    @JsonProperty("dateOfBirth")
    public void setDateOfBirth(LocalDateTime dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }
    
    public String getCountry() {
        return country;
    }
    
    public void setCountry(String country) {
        this.country = country;
    }
    
    public String getState() {
        return state;
    }
    
    public void setState(String state) {
        this.state = state;
    }
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public String getOccupation() {
        return occupation;
    }
    
    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }
    
    public String getGender() {
        return gender;
    }
    
    public void setGender(String gender) {
        this.gender = gender;
    }
}


