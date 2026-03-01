package com.example.demo.common;

public record InterestConfig(
        InterestCalculationMethod method,
        DayCountConvention dayCountConvention,
        RateType rateType,
        Frequency accrualFrequency,
        Frequency compoundingFrequency
) {}