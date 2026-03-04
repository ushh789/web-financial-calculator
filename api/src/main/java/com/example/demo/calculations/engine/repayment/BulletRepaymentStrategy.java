package com.example.demo.calculations.engine.repayment;

import com.example.demo.model.AmortizationType;
import com.example.demo.common.Money;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

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