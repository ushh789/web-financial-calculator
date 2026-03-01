package com.example.demo.calculations.engine.product;

import com.example.demo.common.ProductType;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProductEngineStrategyFactory {

    private final List<ProductEngineStrategy> strategies;

    public ProductEngineStrategyFactory(List<ProductEngineStrategy> strategies) {
        this.strategies = strategies;
    }

    public ProductEngineStrategy getStrategy(ProductType type) {
        return strategies.stream()
                .filter(strategy -> strategy.supports(type))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No engine strategy found for product type: " + type));
    }
}