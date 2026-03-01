package com.example.demo.common;

import java.util.List;
import java.util.Map;

/**
 * Defines the structure and logic of a financial product.
 * This object is deserialized from the 'algorithmMetadata' JSON.
 */
public record FinancialProductDefinition(
        ProductType type,
        InterestConfig interest,
        RepaymentConfig repayment,
        List<LifecycleEvent> lifecycleEvents,
        Map<String, Object> defaultParameters
) {}