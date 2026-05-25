package com.example.demo.calculations.engine.interest;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.example.demo.common.Money;
import com.example.demo.model.DayCountConvention;
import com.example.demo.model.InterestMethod;
import com.example.demo.model.RateType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class CompoundInterestStrategyTest {

    private CompoundInterestStrategy strategy;
    private static final Money BALANCE = Money.of(1000.0, "USD");
    private static final BigDecimal RATE = new BigDecimal("0.05");
    private static final LocalDate START = LocalDate.of(2024, 1, 1);
    private static final LocalDate END = LocalDate.of(2024, 2, 1);

    @BeforeEach
    void setUp() {
        strategy = new CompoundInterestStrategy();
    }

    @Test
    void supports_fixed_compound() {
        assertThat(strategy.supports(RateType.FIXED, InterestMethod.COMPOUND)).isTrue();
    }

    @Test
    void does_not_support_fixed_simple() {
        assertThat(strategy.supports(RateType.FIXED, InterestMethod.SIMPLE)).isFalse();
    }

    @Test
    void does_not_support_floating() {
        assertThat(strategy.supports(RateType.FLOATING, InterestMethod.COMPOUND)).isFalse();
    }

    @Test
    void updateBalance_adds_interest_to_balance() {
        Money interest = Money.of(10.0, "USD");
        Money updated = strategy.updateBalance(BALANCE, interest);

        assertThat(updated.amount().doubleValue()).isCloseTo(1010.0, within(0.001));
        assertThat(updated.currencyCode()).isEqualTo("USD");
    }

    @Test
    void updateBalance_with_zero_interest_returns_same_balance() {
        Money interest = Money.zero("USD");
        Money updated = strategy.updateBalance(BALANCE, interest);

        assertThat(updated.amount()).isEqualByComparingTo(BALANCE.amount());
    }

    @Test
    void calculateInterest_inherited_from_simple_strategy() {
        Money interest = strategy.calculateInterest(BALANCE, RATE, START, END, DayCountConvention.ACTUAL_365);

        // Same formula as simple: 1000 * 0.05 * 31/365
        double expected = 1000.0 * 0.05 * 31.0 / 365.0;
        assertThat(interest.amount().doubleValue()).isCloseTo(expected, within(0.001));
    }

    @Test
    void compound_balance_grows_across_equal_length_periods() {
        // Use equal-length periods (month=ANNUALLY interval, same day count each period)
        LocalDate p1Start = LocalDate.of(2024, 1, 1);
        LocalDate p1End = LocalDate.of(2025, 1, 1);   // exactly 1 year
        LocalDate p2End = LocalDate.of(2026, 1, 1);   // exactly 1 year

        Money interest1 = strategy.calculateInterest(BALANCE, RATE, p1Start, p1End, DayCountConvention.ACTUAL_365);
        Money balance2 = strategy.updateBalance(BALANCE, interest1);
        Money interest2 = strategy.calculateInterest(balance2, RATE, p1End, p2End, DayCountConvention.ACTUAL_365);

        // Balance grows after period 1
        assertThat(balance2.amount()).isGreaterThan(BALANCE.amount());
        // Interest in period 2 is larger because it's applied to a larger balance
        assertThat(interest2.amount()).isGreaterThan(interest1.amount());
    }
}
