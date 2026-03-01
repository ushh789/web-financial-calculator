package com.example.demo.common;

/**
 * Defines how the principal (loan body) is repaid over time.
 */
public enum AmortizationType {
    /**
     * Equal periodic payments (Principal + Interest is constant).
     * Principal portion increases, Interest portion decreases.
     * Most common for mortgages.
     */
    ANNUITY,

    /**
     * Equal principal payments.
     * Total payment decreases over time as interest decreases.
     * Cheaper in total interest than Annuity.
     */
    LINEAR, // Also known as Differentiated

    /**
     * Principal is repaid in full at the end of the term.
     * Interest is paid periodically.
     */
    BULLET,

    /**
     * Principal and all interest are paid at the end.
     * No periodic payments.
     */
    ZERO_COUPON
}