package com.example.demo.calculations.engine.interest;

import com.example.demo.common.Money;
import com.example.demo.model.DayCountConvention;
import com.example.demo.model.RateType;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Interface for interest calculation strategies.
 */
public interface InterestStrategy {

    /**
     * Checks if this strategy supports the given rate type.
     * @param type The rate type to check.
     * @return true if supported, false otherwise.
     */
    boolean supports(RateType type);

    /**
     * Calculates the interest for a given period.
     */
    Money calculateInterest(
            Money balance,
            BigDecimal rate,
            LocalDate startDate,
            LocalDate endDate,
            DayCountConvention convention
    );
}