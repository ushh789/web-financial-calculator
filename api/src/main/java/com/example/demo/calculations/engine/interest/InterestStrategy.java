package com.example.demo.calculations.engine.interest;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.example.demo.common.Money;
import com.example.demo.model.DayCountConvention;
import com.example.demo.model.InterestMethod;
import com.example.demo.model.RateType;

public interface InterestStrategy {

    boolean supports(RateType type, InterestMethod method);

    Money calculateInterest(
            Money balance,
            BigDecimal rate,
            LocalDate startDate,
            LocalDate endDate,
            DayCountConvention convention
    );

    default Money updateBalance(Money balance, Money interest) {
        return balance;
    }
}
