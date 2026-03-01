package com.example.demo.calculations.engine.repayment;

import com.example.demo.common.AmortizationType;
import com.example.demo.common.Money;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;

@Component
public class AnnuityRepaymentStrategy implements RepaymentStrategy {

    @Override
    public boolean supports(AmortizationType type) {
        return type == AmortizationType.ANNUITY;
    }

    @Override
    public Money calculatePrincipalPayment(Money principalBalance, Money interestAmount, BigDecimal annualRate, int periodsRemaining, int periodsPerYear) {
        if (annualRate.compareTo(BigDecimal.ZERO) == 0) {
            return principalBalance.divide(BigDecimal.valueOf(periodsRemaining), 2, RoundingMode.HALF_UP);
        }

        BigDecimal periodicRate = annualRate.divide(BigDecimal.valueOf(periodsPerYear), MathContext.DECIMAL128);
        
        BigDecimal onePlusR = BigDecimal.ONE.add(periodicRate);
        BigDecimal pow = onePlusR.pow(periodsRemaining);
        
        BigDecimal numerator = principalBalance.amount().multiply(periodicRate).multiply(pow);
        BigDecimal denominator = pow.subtract(BigDecimal.ONE);
        
        BigDecimal totalPayment = numerator.divide(denominator, 2, RoundingMode.HALF_UP);
        
        return new Money(totalPayment.subtract(interestAmount.amount()), principalBalance.currencyCode());
    }
}