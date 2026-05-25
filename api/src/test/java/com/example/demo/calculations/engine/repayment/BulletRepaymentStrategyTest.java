package com.example.demo.calculations.engine.repayment;

import java.math.BigDecimal;

import com.example.demo.common.Money;
import com.example.demo.model.AmortizationType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class BulletRepaymentStrategyTest {

    private BulletRepaymentStrategy strategy;

    @BeforeEach
    void setUp() {
        strategy = new BulletRepaymentStrategy();
    }

    @Test
    void supports_bullet() {
        assertThat(strategy.supports(AmortizationType.BULLET)).isTrue();
    }

    @Test
    void does_not_support_annuity() {
        assertThat(strategy.supports(AmortizationType.ANNUITY)).isFalse();
    }

    @Test
    void does_not_support_linear() {
        assertThat(strategy.supports(AmortizationType.LINEAR)).isFalse();
    }

    @Test
    void always_returns_zero_principal() {
        Money balance = Money.of(1000.0, "USD");
        Money interest = Money.of(10.0, "USD");

        Money principal = strategy.calculatePrincipalPayment(balance, interest, new BigDecimal("0.05"), 12, 12);

        assertThat(principal.amount()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(principal.currencyCode()).isEqualTo("USD");
    }

    @Test
    void returns_zero_on_last_period_as_well() {
        Money balance = Money.of(1000.0, "USD");
        Money interest = Money.of(10.0, "USD");

        Money principal = strategy.calculatePrincipalPayment(balance, interest, new BigDecimal("0.05"), 1, 12);

        assertThat(principal.amount()).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
