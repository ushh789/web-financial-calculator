package com.example.demo.calculations.engine.product;

import com.example.demo.calculations.engine.interest.InterestStrategy;
import com.example.demo.calculations.engine.interest.InterestStrategyFactory;
import com.example.demo.calculations.engine.repayment.RepaymentStrategy;
import com.example.demo.calculations.engine.repayment.RepaymentStrategyFactory;
import com.example.demo.calculations.engine.timeline.TimelineGenerator;
import com.example.demo.common.CalculationResult;
import com.example.demo.common.CashFlow;
import com.example.demo.common.FinancialProductDefinition;
import com.example.demo.common.InterestCalculationMethod;
import com.example.demo.common.Money;
import com.example.demo.common.PaymentBreakdown;
import com.example.demo.common.ProductType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class DepositEngineStrategy implements ProductEngineStrategy {
    private final TimelineGenerator timelineGenerator;
    private final InterestStrategyFactory interestStrategyFactory;
    private final RepaymentStrategyFactory repaymentStrategyFactory;

    @Override
    public boolean supports(ProductType type) {
        return type == ProductType.INVESTMENT;
    }

    @Override
    public CalculationResult generateSchedule(FinancialProductDefinition product, Map<String, Object> input) {
        Map<String, Object> params = product.defaultParameters();
        params.putAll(input);

        Money amount = Money.of(((Number) params.get("amount")).doubleValue(), (String) params.getOrDefault("currency", "USD"));
        BigDecimal rate = BigDecimal.valueOf(((Number) params.get("rate")).doubleValue()).divide(BigDecimal.valueOf(100));
        int term = ((Number) params.get("term")).intValue();
        LocalDate startDate = LocalDate.now();
        int scale = ((Number) params.getOrDefault("roundingScale", 2)).intValue();
        RoundingMode roundingMode = RoundingMode.valueOf((String) params.getOrDefault("roundingMode", "HALF_UP"));

        List<LocalDate> dates = timelineGenerator.generateDates(startDate, term, product.repayment().frequency());
        
        CalculationResult result = new CalculationResult();
        result.addSimple(startDate, amount, CashFlow.CashFlowType.OUTFLOW, "Deposit Placement");

        Money balance = amount;
        LocalDate prevDate = startDate;

        for (int i = 0; i < dates.size(); i++) {
            LocalDate currentDate = dates.get(i);
            
            InterestStrategy interestStrategy = interestStrategyFactory.getStrategy(product.interest().rateType());
            Money interestForPeriod = interestStrategy.calculateInterest(balance, rate, prevDate, currentDate, product.interest().dayCountConvention());

            // Capitalization logic
            if (product.interest().method() == InterestCalculationMethod.COMPOUND) {
                balance = balance.add(interestForPeriod);
            }
            
            RepaymentStrategy repaymentStrategy = repaymentStrategyFactory.getStrategy(product.repayment().strategy());
            Money principalPayment = repaymentStrategy.calculatePrincipalPayment(balance, interestForPeriod, rate, term - i, product.repayment().frequency().getNominalPeriodsPerYear());

            if (i == dates.size() - 1) {
                principalPayment = balance;
            }

            PaymentBreakdown breakdown = new PaymentBreakdown(
                principalPayment.round(scale, roundingMode),
                interestForPeriod.round(scale, roundingMode),
                Money.zero(amount.currencyCode())
            );

            // For SIMPLE interest, we pay out interest. For COMPOUND, it's already added to balance.
            if (product.interest().method() == InterestCalculationMethod.SIMPLE) {
                 result.add(currentDate, new PaymentBreakdown(Money.zero(amount.currencyCode()), breakdown.interest(), Money.zero(amount.currencyCode())), CashFlow.CashFlowType.INFLOW, "Interest Payout");
            }
            
            // If there is a principal repayment (usually only at the end for deposits)
            if (principalPayment.amount().compareTo(BigDecimal.ZERO) > 0) {
                 result.add(currentDate, new PaymentBreakdown(principalPayment, Money.zero(amount.currencyCode()), Money.zero(amount.currencyCode())), CashFlow.CashFlowType.INFLOW, "Principal Repayment");
            }

            balance = balance.subtract(principalPayment);
            prevDate = currentDate;
        }

        return result;
    }
}