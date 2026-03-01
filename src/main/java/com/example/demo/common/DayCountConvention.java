package com.example.demo.common;

/**
 * Standard conventions for calculating day counts and year fractions.
 * Critical for accurate interest calculation.
 */
public enum DayCountConvention {
    /**
     * US (NASD) 30/360.
     * Assumes every month has 30 days and a year has 360 days.
     * Standard for US corporate bonds and many mortgages.
     */
    THIRTY_360,

    /**
     * Actual/360.
     * Uses actual number of days in the period, but assumes a 360-day year.
     * Common in money markets and commercial loans.
     */
    ACTUAL_360,

    /**
     * Actual/365 (Fixed).
     * Uses actual number of days in the period, but assumes a 365-day year.
     * Common in UK, Canada, and some consumer loans.
     */
    ACTUAL_365,

    /**
     * Actual/Actual (ISDA).
     * Uses actual number of days in the period and actual number of days in the year (365 or 366).
     * Most accurate, used for US Treasury bonds.
     */
    ACTUAL_ACTUAL
}