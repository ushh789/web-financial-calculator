package com.example.demo.calculations.engine.repayment;

import java.math.BigDecimal;

import com.example.demo.common.Money;
import com.example.demo.model.AmortizationType;

import org.springframework.stereotype.Component;

@Component
public class BulletRepaymentStrategy implements RepaymentStrategy {

    @Override
    public boolean supports(AmortizationType type) {
        return type == AmortizationType.BULLET;
    }

    @Override
    public Money calculatePrincipalPayment(Money principalBalance, Money interestAmount, BigDecimal rate, int periodsRemaining, int periodsPerYear) {
        return Money.zero(principalBalance.currencyCode());
    }
}