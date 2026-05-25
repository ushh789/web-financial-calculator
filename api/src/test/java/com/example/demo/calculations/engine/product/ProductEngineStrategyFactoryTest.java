package com.example.demo.calculations.engine.product;

import java.util.List;

import com.example.demo.calculations.engine.interest.CompoundInterestStrategy;
import com.example.demo.calculations.engine.interest.InterestStrategyFactory;
import com.example.demo.calculations.engine.interest.SimpleInterestStrategy;
import com.example.demo.calculations.engine.repayment.AnnuityRepaymentStrategy;
import com.example.demo.calculations.engine.repayment.BulletRepaymentStrategy;
import com.example.demo.calculations.engine.repayment.LinearRepaymentStrategy;
import com.example.demo.calculations.engine.repayment.RepaymentStrategyFactory;
import com.example.demo.calculations.engine.repayment.ZeroCouponRepaymentStrategy;
import com.example.demo.calculations.engine.timeline.TimelineGenerator;
import com.example.demo.model.ProductType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ProductEngineStrategyFactoryTest {

    private ProductEngineStrategyFactory factory;
    private TimelineGenerator timelineGenerator;
    private InterestStrategyFactory interestFactory;
    private RepaymentStrategyFactory repaymentFactory;

    @BeforeEach
    void setUp() {
        timelineGenerator = new TimelineGenerator();
        interestFactory = new InterestStrategyFactory(List.of(new SimpleInterestStrategy(), new CompoundInterestStrategy()));
        repaymentFactory = new RepaymentStrategyFactory(List.of(
                new AnnuityRepaymentStrategy(), new LinearRepaymentStrategy(),
                new BulletRepaymentStrategy(), new ZeroCouponRepaymentStrategy()
        ));
        factory = new ProductEngineStrategyFactory(List.of(
                new DepositEngineStrategy(timelineGenerator, interestFactory, repaymentFactory),
                new LoanEngineStrategy(timelineGenerator, interestFactory, repaymentFactory)
        ));
    }

    @Test
    void returns_deposit_strategy_for_deposit_type() {
        ProductEngineStrategy result = factory.getStrategy(ProductType.DEPOSIT);
        assertThat(result).isInstanceOf(DepositEngineStrategy.class);
    }

    @Test
    void returns_loan_strategy_for_loan_type() {
        ProductEngineStrategy result = factory.getStrategy(ProductType.LOAN);
        assertThat(result).isInstanceOf(LoanEngineStrategy.class);
    }

    @Test
    void throws_when_no_strategy_matches() {
        ProductEngineStrategyFactory emptyFactory = new ProductEngineStrategyFactory(List.of());
        assertThatThrownBy(() -> emptyFactory.getStrategy(ProductType.DEPOSIT))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("No strategy found");
    }
}
