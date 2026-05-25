package com.example.demo.calculations.engine;

import com.example.demo.TestFixtures;
import com.example.demo.calculations.engine.product.ProductEngineStrategy;
import com.example.demo.calculations.engine.product.ProductEngineStrategyFactory;
import com.example.demo.common.CalculationResult;
import com.example.demo.model.AmortizationType;
import com.example.demo.model.CalculationInputDto;
import com.example.demo.model.FinancialProductDefinitionDto;
import com.example.demo.model.ProductType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FinancialProductEngineTest {

    @Mock
    private ProductEngineStrategyFactory strategyFactory;

    @Mock
    private ProductEngineStrategy depositStrategy;

    private FinancialProductEngine engine;

    @BeforeEach
    void setUp() {
        engine = new FinancialProductEngine(strategyFactory);
    }

    @Test
    void delegates_to_correct_strategy() {
        FinancialProductDefinitionDto product = TestFixtures.depositProduct();
        CalculationInputDto input = TestFixtures.defaultInput();
        CalculationResult expected = new CalculationResult();

        when(strategyFactory.getStrategy(ProductType.DEPOSIT)).thenReturn(depositStrategy);
        when(depositStrategy.generateSchedule(product, input)).thenReturn(expected);

        CalculationResult result = engine.generateSchedule(product, input);

        assertThat(result).isSameAs(expected);
        verify(strategyFactory).getStrategy(ProductType.DEPOSIT);
        verify(depositStrategy).generateSchedule(product, input);
    }

    @Test
    void passes_product_and_input_to_strategy() {
        FinancialProductDefinitionDto product = TestFixtures.loanProduct(AmortizationType.ANNUITY);
        CalculationInputDto input = TestFixtures.defaultInput();
        CalculationResult expected = new CalculationResult();

        when(strategyFactory.getStrategy(ProductType.LOAN)).thenReturn(depositStrategy);
        when(depositStrategy.generateSchedule(product, input)).thenReturn(expected);

        engine.generateSchedule(product, input);

        verify(depositStrategy).generateSchedule(product, input);
    }
}
