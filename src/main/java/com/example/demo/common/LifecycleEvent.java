package com.example.demo.common;

/**
 * Defines a specific event in the product's lifecycle.
 * Examples: "Disbursement", "Monthly Payment", "Early Withdrawal Penalty".
 */
public record LifecycleEvent(
        String code,           // Unique code: "DISBURSEMENT", "LATE_FEE"
        EventType type,        // ONE_TIME, RECURRING
        String triggerCondition, // SpEL: "#period == 0" or "#balance < 0"
        String valueExpression,  // SpEL: "#input.amount * 0.01"
        String description
) {}