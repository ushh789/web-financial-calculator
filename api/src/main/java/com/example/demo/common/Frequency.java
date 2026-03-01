package com.example.demo.common;

import lombok.Getter;

import java.time.Period;

/**
 * Defines how often an event occurs.
 */
@Getter
public enum Frequency {
    DAILY(Period.ofDays(1)),
    WEEKLY(Period.ofWeeks(1)),
    BI_WEEKLY(Period.ofWeeks(2)),
    MONTHLY(Period.ofMonths(1)),
    QUARTERLY(Period.ofMonths(3)),
    SEMI_ANNUALLY(Period.ofMonths(6)),
    ANNUALLY(Period.ofYears(1)),
    ONCE(Period.ZERO);

    private final Period period;

    Frequency(Period period) {
        this.period = period;
    }

    /**
     * Returns the approximate number of periods in a year.
     * Useful for nominal rate calculations (e.g. rate / 12).
     * For DAILY, it returns 365 (standard convention for nominal rates).
     */
    public int getNominalPeriodsPerYear() {
        return switch (this) {
            case DAILY -> 365;
            case WEEKLY -> 52;
            case BI_WEEKLY -> 26;
            case MONTHLY -> 12;
            case QUARTERLY -> 4;
            case SEMI_ANNUALLY -> 2;
            case ANNUALLY -> 1;
            case ONCE -> 0;
        };
    }
}