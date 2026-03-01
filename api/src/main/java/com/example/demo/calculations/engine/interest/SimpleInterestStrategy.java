package com.example.demo.calculations.engine.interest;

import com.example.demo.common.DayCountConvention;
import com.example.demo.common.Money;
import com.example.demo.common.RateType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.MathContext;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
public class SimpleInterestStrategy implements InterestStrategy {

    @Override
    public boolean supports(RateType type) {
        return type == RateType.FIXED;
    }

    @Override
    public Money calculateInterest(Money balance, BigDecimal rate, LocalDate startDate, LocalDate endDate, DayCountConvention convention) {
        BigDecimal yearFraction = getYearFraction(startDate, endDate, convention);
        
        BigDecimal interestAmount = balance.amount()
                .multiply(rate)
                .multiply(yearFraction, MathContext.DECIMAL128);
                
        return new Money(interestAmount, balance.currencyCode());
    }

    private BigDecimal getYearFraction(LocalDate start, LocalDate end, DayCountConvention convention) {
        if (start.isAfter(end) || start.isEqual(end)) {
            return BigDecimal.ZERO;
        }

        return switch (convention) {
            case ACTUAL_365 -> BigDecimal.valueOf(ChronoUnit.DAYS.between(start, end)).divide(BigDecimal.valueOf(365), MathContext.DECIMAL128);
            case ACTUAL_360 -> BigDecimal.valueOf(ChronoUnit.DAYS.between(start, end)).divide(BigDecimal.valueOf(360), MathContext.DECIMAL128);
            case THIRTY_360 -> getThirty360YearFraction(start, end);
            case ACTUAL_ACTUAL -> getActualActualYearFraction(start, end);
        };
    }

    private BigDecimal getActualActualYearFraction(LocalDate start, LocalDate end) {
        BigDecimal totalFraction = BigDecimal.ZERO;
        LocalDate current = start;

        while (current.isBefore(end)) {
            LocalDate yearEnd = current.withDayOfYear(current.lengthOfYear());
            LocalDate periodEnd = end.isBefore(yearEnd) ? end : yearEnd;
            
            long daysInPeriod = ChronoUnit.DAYS.between(current, periodEnd);
            if (daysInPeriod > 0) {
                BigDecimal daysInYear = BigDecimal.valueOf(current.lengthOfYear());
                totalFraction = totalFraction.add(BigDecimal.valueOf(daysInPeriod).divide(daysInYear, MathContext.DECIMAL128));
            }
            
            current = yearEnd;
        }
        return totalFraction;
    }

    private BigDecimal getThirty360YearFraction(LocalDate start, LocalDate end) {
        // Simplified US 30/360
        int d1 = start.getDayOfMonth();
        int d2 = end.getDayOfMonth();
        
        if (d1 == 31) d1 = 30;
        if (d2 == 31 && d1 == 30) d2 = 30;

        long days = (end.getYear() - start.getYear()) * 360L +
                    (end.getMonthValue() - start.getMonthValue()) * 30L +
                    (d2 - d1);
                    
        return BigDecimal.valueOf(days).divide(BigDecimal.valueOf(360), MathContext.DECIMAL128);
    }
}