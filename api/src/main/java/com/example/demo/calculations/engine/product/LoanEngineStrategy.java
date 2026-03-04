package com.example.demo.calculations.engine.product;

import com.example.demo.calculations.engine.interest.InterestStrategy;
import com.example.demo.calculations.engine.interest.InterestStrategyFactory;
import com.example.demo.calculations.engine.repayment.RepaymentStrategy;
import com.example.demo.calculations.engine.repayment.RepaymentStrategyFactory;
import com.example.demo.calculations.engine.timeline.TimelineGenerator;
import com.example.demo.model.AmortizationType;
import com.example.demo.common.CalculationResult;
import com.example.demo.common.CashFlow;
import com.example.demo.common.Frequency;
import com.example.demo.common.Money;
import com.example.demo.common.PaymentBreakdown;
import com.example.demo.model.CalculationInputDto;
import com.example.demo.model.DayCountConvention;
import com.example.demo.model.FinancialProductDefinitionDto;
import com.example.demo.model.InterestMethod;
import com.example.demo.model.ProductDefaultsDto;
import com.example.demo.model.ProductType;
import com.example.demo.model.RateType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Component
public class LoanEngineStrategy extends BaseProductEngineStrategy {

    private final InterestStrategyFactory interestStrategyFactory;
    private final RepaymentStrategyFactory repaymentStrategyFactory;

    public LoanEngineStrategy(TimelineGenerator timelineGenerator,
                              InterestStrategyFactory interestStrategyFactory,
                              RepaymentStrategyFactory repaymentStrategyFactory) {
        super(timelineGenerator);
        this.interestStrategyFactory = interestStrategyFactory;
        this.repaymentStrategyFactory = repaymentStrategyFactory;
    }

    @Override
    public boolean supports(ProductType type) {
        return type == ProductType.LOAN;
    }

    @Override
    public CalculationResult generateSchedule(FinancialProductDefinitionDto product, CalculationInputDto input) {
        ProductDefaultsDto defaults = product.getDefaults();
        
        BigDecimal amount = resolveAmount(input);
        BigDecimal rate = resolveRate(input, defaults);
        int term = resolveTerm(input);
        String currency = resolveCurrency(defaults);
        int scale = resolveScale(defaults);
        RoundingMode roundingMode = resolveRoundingMode(defaults);
        
        LocalDate startDate = input.getStartDate() != null ? input.getStartDate() : LocalDate.now();
        Frequency frequency = Frequency.valueOf(product.getRepayment().getFrequency().getValue());
        List<LocalDate> dates = generateDates(startDate, term, frequency);
        
        CalculationResult result = new CalculationResult();
        result.addSimple(startDate, new Money(amount, currency), CashFlow.CashFlowType.INFLOW, "Disbursement");

        Money balance = new Money(amount, currency);
        LocalDate prevDate = startDate;

        for (int i = 0; i < dates.size(); i++) {
            LocalDate currentDate = dates.get(i);
            int periodsRemaining = dates.size() - i;

            DayCountConvention dayCount = product.getInterest().getDayCountConvention();
            RateType rateType = RateType.valueOf(product.getInterest().getRateType().getValue());

            InterestStrategy interestStrategy = interestStrategyFactory.getStrategy(rateType);
            Money interestForPeriod = interestStrategy.calculateInterest(balance, rate, prevDate, currentDate, dayCount);

            AmortizationType amortizationType = AmortizationType.valueOf(product.getRepayment().getStrategy().getValue());
            
            RepaymentStrategy repaymentStrategy = repaymentStrategyFactory.getStrategy(amortizationType);
            Money principalPayment = repaymentStrategy.calculatePrincipalPayment(balance, interestForPeriod, rate, periodsRemaining, frequency.getNominalPeriodsPerYear());
            
            if (i == dates.size() - 1) {
                principalPayment = balance;
            }

            PaymentBreakdown breakdown = new PaymentBreakdown(
                principalPayment.round(scale, roundingMode),
                interestForPeriod.round(scale, roundingMode),
                Money.zero(currency)
            );

            result.add(currentDate, breakdown, CashFlow.CashFlowType.OUTFLOW, "Monthly Payment");

            balance = balance.subtract(principalPayment);
            prevDate = currentDate;
        }

        return result;
    }
}