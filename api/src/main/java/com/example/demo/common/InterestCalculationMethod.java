package com.example.demo.common;

public enum InterestCalculationMethod {
    /** Interest is calculated only on the principal amount. No capitalization. Common for Bonds. */
    SIMPLE,
    /** Interest is calculated on the principal + accumulated interest. Common for Deposits. */
    COMPOUND
}