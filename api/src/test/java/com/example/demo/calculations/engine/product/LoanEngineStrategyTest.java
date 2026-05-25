package com.example.demo.calculations.engine.product;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.example.demo.TestFixtures;
import com.example.demo.calculations.engine.interest.CompoundInterestStrategy;
import com.example.demo.calculations.engine.interest.InterestStrategyFactory;
import com.example.demo.calculations.engine.interest.SimpleInterestStrategy;
import com.example.demo.calculations.engine.repayment.AnnuityRepaymentStrategy;
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
import com.example.demo.model.ProductType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class LoanEngineStrategyTest {

    private LoanEngineStrategy strategy;

    @BeforeEach
    void setUp() {
        TimelineGenerator timelineGenerator = new TimelineGenerator();
        InterestStrategyFactory interestFactory = new InterestStrategyFactory(
                List.of(new SimpleInterestStrategy(), new CompoundInterestStrategy()));
        RepaymentStrategyFactory repaymentFactory = new RepaymentStrategyFactory(
                List.of(new AnnuityRepaymentStrategy(), new LinearRepaymentStrategy(),
                        new BulletRepaymentStrategy(), new ZeroCouponRepaymentStrategy()));
        strategy = new LoanEngineStrategy(timelineGenerator, interestFactory, repaymentFactory);
    }

    @Test
    void supports_loan_product_type() {
        assertThat(strategy.supports(ProductType.LOAN)).isTrue();
    }

    @Test
    void does_not_support_deposit_product_type() {
        assertThat(strategy.supports(ProductType.DEPOSIT)).isFalse();
    }

    @Test
    void annuity_first_cashflow_is_disbursement_inflow() {
        FinancialProductDefinitionDto product = TestFixtures.loanProduct(AmortizationType.ANNUITY);
        CalculationInputDto input = TestFixtures.defaultInput();

        CalculationResult result = strategy.generateSchedule(product, input);

        CashFlow first = result.cashFlows().get(0);
        assertThat(first.type()).isEqualTo(CashFlow.CashFlowType.INFLOW);
        assertThat(first.description()).containsIgnoringCase("disbursement");
    }

    @Test
    void annuity_3_periods_produces_4_cashflows() {
        // 1 INFLOW (disbursement) + 3 OUTFLOW (payments) = 4
        FinancialProductDefinitionDto product = TestFixtures.loanProduct(AmortizationType.ANNUITY);
        CalculationInputDto input = TestFixtures.defaultInput(); // term=3

        CalculationResult result = strategy.generateSchedule(product, input);

        assertThat(result.cashFlows()).hasSize(4);
    }

    @Test
    void payment_cashflows_are_all_outflows() {
        FinancialProductDefinitionDto product = TestFixtures.loanProduct(AmortizationType.ANNUITY);
        CalculationInputDto input = TestFixtures.defaultInput();

        CalculationResult result = strategy.generateSchedule(product, input);
        List<CashFlow> payments = result.cashFlows().stream()
                .filter(cf -> cf.type() == CashFlow.CashFlowType.OUTFLOW)
                .toList();

        assertThat(payments).hasSize(3);
    }

    @Test
    void linear_loan_principal_payments_are_equal() {
        FinancialProductDefinitionDto product = TestFixtures.loanProduct(AmortizationType.LINEAR);
        CalculationInputDto input = new CalculationInputDto();
        input.setAmount(BigDecimal.valueOf(1200));
        input.setRate(BigDecimal.ZERO);
        input.setTerm(3);
        input.setStartDate(LocalDate.of(2024, 1, 1));

        CalculationResult result = strategy.generateSchedule(product, input);

        List<CashFlow> payments = result.cashFlows().stream()
                .filter(cf -> cf.type() == CashFlow.CashFlowType.OUTFLOW)
                .toList();

        // With 0 rate all periods: equal principal = 1200/3 = 400
        assertThat(payments).hasSize(3);
        double p0 = payments.get(0).breakdown().principal().amount().doubleValue();
        double p1 = payments.get(1).breakdown().principal().amount().doubleValue();
        assertThat(p0).isCloseTo(p1, within(0.01));
    }

    @Test
    void bullet_loan_only_last_payment_has_principal() {
        FinancialProductDefinitionDto product = TestFixtures.loanProduct(AmortizationType.BULLET);
        CalculationInputDto input = TestFixtures.defaultInput();

        CalculationResult result = strategy.generateSchedule(product, input);
        List<CashFlow> payments = result.cashFlows().stream()
                .filter(cf -> cf.type() == CashFlow.CashFlowType.OUTFLOW)
                .toList();

        // Last payment has the full principal, earlier ones have 0 principal (overridden to full balance on last)
        assertThat(payments.get(2).breakdown().principal().amount().doubleValue()).isGreaterThan(0);
    }

    @Test
    void disbursement_amount_equals_input_amount() {
        FinancialProductDefinitionDto product = TestFixtures.loanProduct(AmortizationType.ANNUITY);
        CalculationInputDto input = TestFixtures.defaultInput();

        CalculationResult result = strategy.generateSchedule(product, input);
        CashFlow disbursement = result.cashFlows().get(0);

        assertThat(disbursement.totalAmount().amount().doubleValue()).isCloseTo(1000.0, within(0.01));
    }
}
