package com.example.demo.calculations.engine.repayment;

import com.example.demo.model.AmortizationType;
import com.example.demo.common.Money;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class LinearRepaymentStrategy implements RepaymentStrategy {

    @Override
    public boolean supports(AmortizationType type) {
        return type == AmortizationType.LINEAR;
    }

    @Override
    public Money calculatePrincipalPayment(Money principalBalance, Money interestAmount, BigDecimal rate, int periodsRemaining, int periodsPerYear) {
        if (periodsRemaining <= 0) {
            return Money.zero(principalBalance.currencyCode());
        }
        return principalBalance.divide(BigDecimal.valueOf(periodsRemaining), 2, RoundingMode.HALF_UP);
    }
}