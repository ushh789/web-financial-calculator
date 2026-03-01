package com.example.demo.calculations.engine;

import com.example.demo.calculations.engine.product.ProductEngineStrategyFactory;
import com.example.demo.common.CalculationResult;
import com.example.demo.common.FinancialProductDefinition;
import com.example.demo.calculations.engine.product.ProductEngineStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class StandardFinancialProductEngine {

    private final ProductEngineStrategyFactory productEngineStrategyFactory;

    public CalculationResult generateSchedule(FinancialProductDefinition product, Map<String, Object> input) {
        ProductEngineStrategy strategy = productEngineStrategyFactory.getStrategy(product.type());
        return strategy.generateSchedule(product, input);
    }
}