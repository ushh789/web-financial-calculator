package com.example.demo.calculations.engine.product;

import java.util.List;

import com.example.demo.TestFixtures;
import com.example.demo.calculations.engine.interest.CompoundInterestStrategy;
import com.example.demo.calculations.engine.interest.InterestStrategyFactory;
import com.example.demo.calculations.engine.interest.SimpleInterestStrategy;
import com.example.demo.calculations.engine.repayment.BulletRepaymentStrategy;
import com.example.demo.calculations.engine.repayment.LinearRepaymentStrategy;
import com.example.demo.calculations.engine.repayment.RepaymentStrategyFactory;
import com.example.demo.calculations.engine.repayment.ZeroCouponRepaymentStrategy;
import com.example.demo.calculations.engine.timeline.TimelineGenerator;
import com.example.demo.common.CalculationResult;
import com.example.demo.common.CashFlow;
import com.example.demo.model.AmortizationType;
import com.example.demo.model.CalculationInputDto;
import com.example.demo.model.FinancialProductDefinitionDto;
import com.example.demo.model.InterestMethod;
import com.example.demo.model.ProductType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DepositEngineStrategyTest {

    private DepositEngineStrategy strategy;

    @BeforeEach
    void setUp() {
        TimelineGenerator timelineGenerator = new TimelineGenerator();
        InterestStrategyFactory interestFactory = new InterestStrategyFactory(
                List.of(new SimpleInterestStrategy(), new CompoundInterestStrategy()));
        RepaymentStrategyFactory repaymentFactory = new RepaymentStrategyFactory(
                List.of(new BulletRepaymentStrategy(), new LinearRepaymentStrategy(), new ZeroCouponRepaymentStrategy()));
        strategy = new DepositEngineStrategy(timelineGenerator, interestFactory, repaymentFactory);
    }

    @Test
    void supports_deposit_product_type() {
        assertThat(strategy.supports(ProductType.DEPOSIT)).isTrue();
    }

    @Test
    void does_not_support_loan_product_type() {
        assertThat(strategy.supports(ProductType.LOAN)).isFalse();
    }

    @Test
    void bullet_deposit_first_cashflow_is_outflow() {
        FinancialProductDefinitionDto product = TestFixtures.depositProduct();
        CalculationInputDto input = TestFixtures.defaultInput();

        CalculationResult result = strategy.generateSchedule(product, input);

        CashFlow first = result.cashFlows().getFirst();
        assertThat(first.type()).isEqualTo(CashFlow.CashFlowType.OUTFLOW);
        assertThat(first.description()).containsIgnoringCase("deposit");
    }

    @Test
    void bullet_deposit_3_periods_produces_correct_cashflow_count() {
        // 3 periods BULLET: 1 OUTFLOW + 3 interest INFLOWs + 1 principal INFLOW on last date = 5
        FinancialProductDefinitionDto product = TestFixtures.depositProduct();
        CalculationInputDto input = TestFixtures.defaultInput(); // term=3

        CalculationResult result = strategy.generateSchedule(product, input);

        assertThat(result.cashFlows()).hasSize(5);
    }

    @Test
    void last_cashflow_is_principal_repayment_inflow() {
        FinancialProductDefinitionDto product = TestFixtures.depositProduct();
        CalculationInputDto input = TestFixtures.defaultInput();

        CalculationResult result = strategy.generateSchedule(product, input);
        List<CashFlow> flows = result.cashFlows();
        CashFlow last = flows.getLast();

        assertThat(last.type()).isEqualTo(CashFlow.CashFlowType.INFLOW);
        assertThat(last.description()).containsIgnoringCase("principal");
    }

    @Test
    void interest_cashflows_are_all_inflows() {
        FinancialProductDefinitionDto product = TestFixtures.depositProduct();
        CalculationInputDto input = TestFixtures.defaultInput();

        CalculationResult result = strategy.generateSchedule(product, input);
        List<CashFlow> interestFlows = result.cashFlows().stream()
                .filter(cf -> cf.description().contains("Interest"))
                .toList();

        assertThat(interestFlows).isNotEmpty();
        assertThat(interestFlows).allMatch(cf -> cf.type() == CashFlow.CashFlowType.INFLOW);
    }

    @Test
    void compound_interest_balance_grows_over_time() {
        FinancialProductDefinitionDto product = TestFixtures.product(
                ProductType.DEPOSIT, InterestMethod.COMPOUND, AmortizationType.BULLET);
        CalculationInputDto input = TestFixtures.defaultInput();

        CalculationResult result = strategy.generateSchedule(product, input);

        List<CashFlow> interestFlows = result.cashFlows().stream()
                .filter(cf -> cf.description().contains("Interest"))
                .toList();

        // With compound interest, later periods should have higher interest than earlier
        // (balance grows each period)
        assertThat(interestFlows).hasSizeGreaterThan(1);
        double first = interestFlows.getFirst().totalAmount().amount().doubleValue();
        double last = interestFlows.getLast().totalAmount().amount().doubleValue();
        assertThat(last).isGreaterThanOrEqualTo(first);
    }

    @Test
    void single_period_deposit_produces_3_cashflows() {
        FinancialProductDefinitionDto product = TestFixtures.depositProduct();
        CalculationInputDto input = new CalculationInputDto();
        input.setAmount(java.math.BigDecimal.valueOf(1000));
        input.setRate(java.math.BigDecimal.valueOf(5));
        input.setTerm(1);
        input.setStartDate(java.time.LocalDate.of(2024, 1, 1));

        CalculationResult result = strategy.generateSchedule(product, input);

        // 1 OUTFLOW (deposit) + 1 INFLOW (interest) + 1 INFLOW (principal) = 3
        assertThat(result.cashFlows()).hasSize(3);
    }
}
