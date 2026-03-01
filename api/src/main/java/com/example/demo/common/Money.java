package com.example.demo.common;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Represents a monetary value with a specific currency.
 * Immutable Value Object.
 */
public record Money(BigDecimal amount, String currencyCode) {

    public Money {
        if (amount == null) {
            throw new IllegalArgumentException("Amount cannot be null");
        }
        if (currencyCode == null || currencyCode.length() != 3) {
            throw new IllegalArgumentException("Currency code must be a valid 3-letter ISO code");
        }
    }

    public static Money of(double amount, String currency) {
        return new Money(BigDecimal.valueOf(amount), currency);
    }

    public static Money zero(String currency) {
        return new Money(BigDecimal.ZERO, currency);
    }

    public Money add(Money other) {
        checkCurrency(other);
        return new Money(this.amount.add(other.amount), currencyCode);
    }

    public Money subtract(Money other) {
        checkCurrency(other);
        return new Money(this.amount.subtract(other.amount), currencyCode);
    }

    public Money multiply(BigDecimal multiplicand) {
        return new Money(this.amount.multiply(multiplicand), currencyCode);
    }
    
    public Money divide(BigDecimal divisor, int scale, RoundingMode roundingMode) {
        return new Money(this.amount.divide(divisor, scale, roundingMode), currencyCode);
    }

    public Money round(int scale, RoundingMode roundingMode) {
        return new Money(this.amount.setScale(scale, roundingMode), currencyCode);
    }

    private void checkCurrency(Money other) {
        if (!this.currencyCode.equals(other.currencyCode)) {
            throw new IllegalArgumentException("Currency mismatch: " + this.currencyCode + " vs " + other.currencyCode);
        }
    }
}