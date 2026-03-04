package com.example.demo.calculations.engine.product;

import com.example.demo.model.ProductType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ProductEngineStrategyFactory {

    private final List<ProductEngineStrategy> strategies;

    public ProductEngineStrategy getStrategy(ProductType type) {
        return strategies.stream()
                .filter(strategy -> strategy.supports(type))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No strategy found for product type: " + type));
    }
}