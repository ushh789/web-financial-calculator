package com.example.demo.calculations.engine.repayment;

import java.math.BigDecimal;

import com.example.demo.common.Money;
import com.example.demo.model.AmortizationType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class LinearRepaymentStrategyTest {

    private LinearRepaymentStrategy strategy;

    @BeforeEach
    void setUp() {
        strategy = new LinearRepaymentStrategy();
    }

    @Test
    void supports_linear() {
        assertThat(strategy.supports(AmortizationType.LINEAR)).isTrue();
    }

    @Test
    void does_not_support_annuity() {
        assertThat(strategy.supports(AmortizationType.ANNUITY)).isFalse();
    }

    @Test
    void divides_balance_equally() {
        Money balance = Money.of(1200.0, "USD");
        Money interest = Money.zero("USD");

        Money principal = strategy.calculatePrincipalPayment(balance, interest, BigDecimal.ZERO, 12, 12);

        assertThat(principal.amount().doubleValue()).isCloseTo(100.0, within(0.01));
    }

    @Test
    void last_period_returns_full_remaining_balance() {
        Money balance = Money.of(100.0, "USD");
        Money interest = Money.zero("USD");

        Money principal = strategy.calculatePrincipalPayment(balance, interest, BigDecimal.ZERO, 1, 12);

        assertThat(principal.amount().doubleValue()).isCloseTo(100.0, within(0.01));
    }

    @Test
    void zero_periods_returns_zero() {
        Money balance = Money.of(1000.0, "USD");
        Money interest = Money.zero("USD");

        Money principal = strategy.calculatePrincipalPayment(balance, interest, BigDecimal.ZERO, 0, 12);

        assertThat(principal.amount()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void preserves_currency() {
        Money balance = Money.of(1000.0, "EUR");
        Money interest = Money.zero("EUR");

        Money principal = strategy.calculatePrincipalPayment(balance, interest, BigDecimal.ZERO, 4, 12);

        assertThat(principal.currencyCode()).isEqualTo("EUR");
    }
}
