package com.example.demo.calculations.engine.repayment;

import com.example.demo.common.AmortizationType;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RepaymentStrategyFactory {

    private final List<RepaymentStrategy> strategies;

    public RepaymentStrategyFactory(List<RepaymentStrategy> strategies) {
        this.strategies = strategies;
    }

    public RepaymentStrategy getStrategy(AmortizationType type) {
        return strategies.stream()
                .filter(strategy -> strategy.supports(type))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No strategy found for amortization type: " + type));
    }
}