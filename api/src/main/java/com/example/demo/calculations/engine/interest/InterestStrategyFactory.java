package com.example.demo.calculations.engine.interest;

import java.util.List;

import com.example.demo.model.InterestMethod;
import com.example.demo.model.RateType;

import org.springframework.stereotype.Component;

@Component
public class InterestStrategyFactory {

    private final List<InterestStrategy> strategies;

    public InterestStrategyFactory(List<InterestStrategy> strategies) {
        this.strategies = strategies;
    }

    public InterestStrategy getStrategy(RateType type, InterestMethod method) {
        return strategies.stream()
                .filter(s -> s.supports(type, method))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No strategy found for rate type: " + type + ", method: " + method));
    }

    public InterestStrategy getStrategy(RateType type) {
        return getStrategy(type, InterestMethod.SIMPLE);
    }
}
