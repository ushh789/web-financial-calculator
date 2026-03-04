package com.example.demo.calculations.engine;

import com.example.demo.calculations.engine.product.ProductEngineStrategyFactory;
import com.example.demo.common.CalculationResult;
import com.example.demo.model.CalculationInputDto;
import com.example.demo.model.FinancialProductDefinitionDto;
import com.example.demo.calculations.engine.product.ProductEngineStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StandardFinancialProductEngine {

    private final ProductEngineStrategyFactory productEngineStrategyFactory;

    public CalculationResult generateSchedule(FinancialProductDefinitionDto product, CalculationInputDto input) {
        ProductEngineStrategy strategy = productEngineStrategyFactory.getStrategy(product.getType());
        return strategy.generateSchedule(product, input);
    }
}