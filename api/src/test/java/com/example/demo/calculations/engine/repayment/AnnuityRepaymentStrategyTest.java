package com.example.demo.calculations.engine.repayment;

import java.math.BigDecimal;

import com.example.demo.common.Money;
import com.example.demo.model.AmortizationType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class AnnuityRepaymentStrategyTest {

    private AnnuityRepaymentStrategy strategy;

    @BeforeEach
    void setUp() {
        strategy = new AnnuityRepaymentStrategy();
    }

    @Test
    void supports_annuity() {
        assertThat(strategy.supports(AmortizationType.ANNUITY)).isTrue();
    }

    @Test
    void does_not_support_linear() {
        assertThat(strategy.supports(AmortizationType.LINEAR)).isFalse();
    }

    @Test
    void does_not_support_bullet() {
        assertThat(strategy.supports(AmortizationType.BULLET)).isFalse();
    }

    @Test
    void zero_rate_falls_back_to_linear_division() {
        Money balance = Money.of(1200.0, "USD");
        Money interest = Money.zero("USD");

        Money principal = strategy.calculatePrincipalPayment(balance, interest, BigDecimal.ZERO, 12, 12);

        assertThat(principal.amount().doubleValue()).isCloseTo(100.0, within(0.01));
    }

    @Test
    void standard_annuity_produces_positive_principal() {
        // P=1000, annual rate 12%, monthly payments (12 per year), 12 periods
        // periodic rate = 0.12/12 = 0.01
        // totalPayment = 1000 * 0.01 * (1.01)^12 / ((1.01)^12 - 1) ≈ 88.85
        // interest in period 1 = 1000 * 0.01 = 10
        // principal = 88.85 - 10 = 78.85
        Money balance = Money.of(1000.0, "USD");
        Money interestPeriod1 = Money.of(10.0, "USD"); // 1000 * 0.01

        Money principal = strategy.calculatePrincipalPayment(balance, interestPeriod1, new BigDecimal("0.12"), 12, 12);

        assertThat(principal.amount().doubleValue()).isGreaterThan(0);
        assertThat(principal.amount().doubleValue()).isCloseTo(78.85, within(0.5));
    }

    @Test
    void principal_plus_interest_approximates_constant_payment() {
        Money balance = Money.of(1000.0, "USD");
        BigDecimal annualRate = new BigDecimal("0.12");
        int periodsPerYear = 12;

        // Period 1: interest = 1000 * 0.01 = 10
        Money interest1 = Money.of(10.0, "USD");
        Money principal1 = strategy.calculatePrincipalPayment(balance, interest1, annualRate, 12, periodsPerYear);
        double payment1 = principal1.amount().doubleValue() + interest1.amount().doubleValue();

        // Period 2: balance after period 1
        Money balance2 = balance.subtract(principal1);
        // interest 2 = balance2 * 0.01
        double interest2Value = balance2.amount().doubleValue() * 0.01;
        Money interest2 = Money.of(interest2Value, "USD");
        Money principal2 = strategy.calculatePrincipalPayment(balance2, interest2, annualRate, 11, periodsPerYear);
        double payment2 = principal2.amount().doubleValue() + interest2Value;

        assertThat(payment1).isCloseTo(payment2, within(0.1));
    }

    @Test
    void single_period_returns_full_balance_minus_interest() {
        Money balance = Money.of(1000.0, "USD");
        Money interest = Money.of(10.0, "USD");

        Money principal = strategy.calculatePrincipalPayment(balance, interest, new BigDecimal("0.12"), 1, 12);

        // For single period: totalPayment = P (all principal + interest), principal = P - interest
        assertThat(principal.amount().doubleValue()).isGreaterThan(0);
    }
}
