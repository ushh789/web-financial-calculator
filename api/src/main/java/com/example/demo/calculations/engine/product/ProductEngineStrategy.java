package com.example.demo.calculations.engine.product;

import com.example.demo.common.CalculationResult;
import com.example.demo.model.CalculationInputDto;
import com.example.demo.model.FinancialProductDefinitionDto;
import com.example.demo.model.ProductType;

public interface ProductEngineStrategy {

    /**
     * Checks if this strategy supports the given product type.
     */
    boolean supports(ProductType type);

    /**
     * Generates a schedule for the given product and input.
     */
    CalculationResult generateSchedule(FinancialProductDefinitionDto product, CalculationInputDto input);
}