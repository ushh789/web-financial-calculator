package com.example.demo.common;

import java.time.LocalDate;
import java.util.LinkedList;
import java.util.List;

public record CalculationResult(List<CashFlow> cashFlows) {

    public CalculationResult() {
        this(new LinkedList<>());
    }

    public void add(LocalDate date, PaymentBreakdown breakdown, CashFlow.CashFlowType type, String description) {
        cashFlows.add(new CashFlow(date, breakdown.total(), type, description, breakdown));
    }
    
    public void addSimple(LocalDate date, Money amount, CashFlow.CashFlowType type, String description) {
        cashFlows.add(CashFlow.simple(date, amount, type, description));
    }
}