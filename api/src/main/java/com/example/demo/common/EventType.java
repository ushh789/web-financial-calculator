package com.example.demo.common;

public enum EventType {
    ONE_TIME,   // Happens once (Start, End, Specific Date)
    RECURRING,  // Happens periodically (Monthly, Daily)
    CONDITIONAL // Happens when a condition is met (Penalty)
}