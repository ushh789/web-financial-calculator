package com.example.demo.calculations.engine.repayment;

import java.util.List;

import com.example.demo.model.AmortizationType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RepaymentStrategyFactoryTest {

    private RepaymentStrategyFactory factory;

    @BeforeEach
    void setUp() {
        factory = new RepaymentStrategyFactory(List.of(
                new AnnuityRepaymentStrategy(),
                new LinearRepaymentStrategy(),
                new BulletRepaymentStrategy(),
                new ZeroCouponRepaymentStrategy()
        ));
    }

    @Test
    void returns_annuity_strategy() {
        RepaymentStrategy result = factory.getStrategy(AmortizationType.ANNUITY);
        assertThat(result).isInstanceOf(AnnuityRepaymentStrategy.class);
    }

    @Test
    void returns_linear_strategy() {
        RepaymentStrategy result = factory.getStrategy(AmortizationType.LINEAR);
        assertThat(result).isInstanceOf(LinearRepaymentStrategy.class);
    }

    @Test
    void returns_bullet_strategy() {
        RepaymentStrategy result = factory.getStrategy(AmortizationType.BULLET);
        assertThat(result).isInstanceOf(BulletRepaymentStrategy.class);
    }

    @Test
    void returns_zero_coupon_strategy() {
        RepaymentStrategy result = factory.getStrategy(AmortizationType.ZERO_COUPON);
        assertThat(result).isInstanceOf(ZeroCouponRepaymentStrategy.class);
    }

    @Test
    void throws_when_empty_strategy_list() {
        RepaymentStrategyFactory emptyFactory = new RepaymentStrategyFactory(List.of());
        assertThatThrownBy(() -> emptyFactory.getStrategy(AmortizationType.ANNUITY))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("No strategy found");
    }
}
