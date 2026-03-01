package com.example.demo.common;

/**
 * Represents the breakdown of a payment into its core components.
 * All amounts should be positive.
 */
public record PaymentBreakdown(
        Money principal,
        Money interest,
        Money fee
) {
    public static PaymentBreakdown zero(String currency) {
        return new PaymentBreakdown(Money.zero(currency), Money.zero(currency), Money.zero(currency));
    }

    public Money total() {
        return principal.add(interest).add(fee);
    }
}