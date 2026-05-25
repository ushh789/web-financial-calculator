package com.example.demo.calculations.engine.interest;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.example.demo.common.CalculationResult;
import com.example.demo.common.CashFlow;
import com.example.demo.common.Money;
import com.example.demo.common.PaymentBreakdown;
import com.example.demo.model.DayCountConvention;
import com.example.demo.model.InterestMethod;
import com.example.demo.model.RateType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class SimpleInterestStrategyTest {

    private SimpleInterestStrategy strategy;
    private static final Money BALANCE = Money.of(1000.0, "USD");
    private static final BigDecimal RATE = new BigDecimal("0.05");
    private static final LocalDate START = LocalDate.of(2024, 1, 1);
    private static final LocalDate END = LocalDate.of(2024, 2, 1); // 31 days

    @BeforeEach
    void setUp() {
        strategy = new SimpleInterestStrategy();
    }

    @Test
    void supports_fixed_simple() {
        assertThat(strategy.supports(RateType.FIXED, InterestMethod.SIMPLE)).isTrue();
    }

    @Test
    void does_not_support_fixed_compound() {
        assertThat(strategy.supports(RateType.FIXED, InterestMethod.COMPOUND)).isFalse();
    }

    @Test
    void does_not_support_floating() {
        assertThat(strategy.supports(RateType.FLOATING, InterestMethod.SIMPLE)).isFalse();
    }

    @Test
    void calculateInterest_actual365() {
        Money interest = strategy.calculateInterest(BALANCE, RATE, START, END, DayCountConvention.ACTUAL_365);

        // 1000 * 0.05 * 31/365 = 4.2466...
        double expected = 1000.0 * 0.05 * 31.0 / 365.0;
        assertThat(interest.amount().doubleValue()).isCloseTo(expected, within(0.001));
        assertThat(interest.currencyCode()).isEqualTo("USD");
    }

    @Test
    void calculateInterest_actual360() {
        Money interest = strategy.calculateInterest(BALANCE, RATE, START, END, DayCountConvention.ACTUAL_360);

        // 1000 * 0.05 * 31/360 = 4.3055...
        double expected = 1000.0 * 0.05 * 31.0 / 360.0;
        assertThat(interest.amount().doubleValue()).isCloseTo(expected, within(0.001));
    }

    @Test
    void calculateInterest_thirty360() {
        // Jan 1 → Feb 1: d1=1, d2=1, month diff=1 → 30 days under 30/360
        Money interest = strategy.calculateInterest(BALANCE, RATE, START, END, DayCountConvention.THIRTY_360);

        // 1000 * 0.05 * 30/360 = 4.1666...
        double expected = 1000.0 * 0.05 * 30.0 / 360.0;
        assertThat(interest.amount().doubleValue()).isCloseTo(expected, within(0.001));
    }

    @Test
    void calculateInterest_actualActual_leapYear() {
        // 2024 is leap year, 366 days; Jan 1 → Feb 1 = 31 days
        Money interest = strategy.calculateInterest(BALANCE, RATE, START, END, DayCountConvention.ACTUAL_ACTUAL);

        // 1000 * 0.05 * 31/366 = 4.2349...
        double expected = 1000.0 * 0.05 * 31.0 / 366.0;
        assertThat(interest.amount().doubleValue()).isCloseTo(expected, within(0.001));
    }

    @Test
    void calculateInterest_zero_when_start_equals_end() {
        Money interest = strategy.calculateInterest(BALANCE, RATE, START, START, DayCountConvention.ACTUAL_365);

        assertThat(interest.amount()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void calculateInterest_zero_when_start_after_end() {
        Money interest = strategy.calculateInterest(BALANCE, RATE, END, START, DayCountConvention.ACTUAL_365);

        assertThat(interest.amount()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void updateBalance_returns_same_balance_for_simple_interest() {
        Money interest = Money.of(10.0, "USD");
        Money updated = strategy.updateBalance(BALANCE, interest);

        assertThat(updated).isEqualTo(BALANCE);
    }

    @Test
    void recordInterestCashFlow_adds_inflow_to_result() {
        CalculationResult result = new CalculationResult();
        Money interestAmount = Money.of(50.0, "USD");
        PaymentBreakdown breakdown = new PaymentBreakdown(Money.zero("USD"), interestAmount, Money.zero("USD"));

        strategy.recordInterestCashFlow(result, START, breakdown, "USD");

        assertThat(result.cashFlows()).hasSize(1);
        CashFlow cf = result.cashFlows().get(0);
        assertThat(cf.type()).isEqualTo(CashFlow.CashFlowType.INFLOW);
        assertThat(cf.date()).isEqualTo(START);
    }
}
