package com.example.demo.calculations.engine.product;

import com.example.demo.common.CalculationResult;
import com.example.demo.common.FinancialProductDefinition;
import com.example.demo.common.ProductType;

import java.util.Map;

/**
 * Strategy for generating a payment schedule for a specific product type (e.g., LOAN, DEPOSIT).
 */
public interface ProductEngineStrategy {

    /**
     * Checks if this strategy supports the given product type.
     */
    boolean supports(ProductType type);

    /**
     * Generates the full cash flow schedule for a product.
     */
    CalculationResult generateSchedule(FinancialProductDefinition product, Map<String, Object> input);
}