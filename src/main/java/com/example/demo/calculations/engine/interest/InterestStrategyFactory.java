package com.example.demo.calculations.engine.interest;

import com.example.demo.common.RateType;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class InterestStrategyFactory {

    private final List<InterestStrategy> strategies;

    public InterestStrategyFactory(List<InterestStrategy> strategies) {
        this.strategies = strategies;
    }

    public InterestStrategy getStrategy(RateType type) {
        return strategies.stream()
                .filter(strategy -> strategy.supports(type))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No strategy found for rate type: " + type));
    }
}