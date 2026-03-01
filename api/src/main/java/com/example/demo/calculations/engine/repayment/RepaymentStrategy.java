package com.example.demo.calculations.engine.repayment;

import com.example.demo.common.AmortizationType;
import com.example.demo.common.Money;

import java.math.BigDecimal;

public interface RepaymentStrategy {
    
    boolean supports(AmortizationType type);

    /**
     * Calculates the PRINCIPAL portion of the payment for the period.
     *
     * @param principalBalance Current outstanding balance
     * @param interestAmount Interest calculated for this period (needed for Annuity)
     * @param rate Annual rate (needed for Annuity formula)
     * @param periodsRemaining Number of periods left
     * @param periodsPerYear Frequency of payments
     * @return The amount of principal to be repaid
     */
    Money calculatePrincipalPayment(
            Money principalBalance,
            Money interestAmount,
            BigDecimal rate,
            int periodsRemaining,
            int periodsPerYear
    );
}