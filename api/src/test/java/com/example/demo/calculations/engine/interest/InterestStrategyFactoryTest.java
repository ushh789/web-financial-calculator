package com.example.demo.calculations.engine.interest;

import java.util.List;

import com.example.demo.model.InterestMethod;
import com.example.demo.model.RateType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class InterestStrategyFactoryTest {

    private InterestStrategyFactory factory;
    private SimpleInterestStrategy simpleStrategy;
    private CompoundInterestStrategy compoundStrategy;

    @BeforeEach
    void setUp() {
        simpleStrategy = new SimpleInterestStrategy();
        compoundStrategy = new CompoundInterestStrategy();
        factory = new InterestStrategyFactory(List.of(simpleStrategy, compoundStrategy));
    }

    @Test
    void returns_simple_strategy_for_fixed_simple() {
        InterestStrategy result = factory.getStrategy(RateType.FIXED, InterestMethod.SIMPLE);

        assertThat(result).isInstanceOf(SimpleInterestStrategy.class);
    }

    @Test
    void returns_compound_strategy_for_fixed_compound() {
        InterestStrategy result = factory.getStrategy(RateType.FIXED, InterestMethod.COMPOUND);

        assertThat(result).isInstanceOf(CompoundInterestStrategy.class);
    }

    @Test
    void convenience_overload_defaults_to_simple() {
        InterestStrategy result = factory.getStrategy(RateType.FIXED);

        assertThat(result).isInstanceOf(SimpleInterestStrategy.class);
    }

    @Test
    void throws_when_no_strategy_matches() {
        assertThatThrownBy(() -> factory.getStrategy(RateType.FLOATING, InterestMethod.COMPOUND))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("No strategy found");
    }
}
