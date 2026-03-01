package com.example.demo.common;

import java.time.LocalDate;

/**
 * Represents a single movement of money at a specific point in time,
 * with a breakdown of its components.
 */
public record CashFlow(
        LocalDate date,
        Money totalAmount,
        CashFlowType type,
        String description,
        PaymentBreakdown breakdown
) {
    public enum CashFlowType {
        INFLOW,
        OUTFLOW
    }

    public static CashFlow simple(LocalDate date, Money amount, CashFlowType type, String description) {
        PaymentBreakdown breakdown = PaymentBreakdown.zero(amount.currencyCode());
        if (description.toLowerCase().contains("principal")) {
            breakdown = new PaymentBreakdown(amount, Money.zero(amount.currencyCode()), Money.zero(amount.currencyCode()));
        } else if (description.toLowerCase().contains("interest")) {
            breakdown = new PaymentBreakdown(Money.zero(amount.currencyCode()), amount, Money.zero(amount.currencyCode()));
        }
        return new CashFlow(date, amount, type, description, breakdown);
    }
}