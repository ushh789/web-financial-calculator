package com.example.demo.common;

public record RepaymentConfig(
        AmortizationType strategy, // ANNUITY, BULLET, etc.
        Frequency frequency // How often payments/payouts happen
) {
}