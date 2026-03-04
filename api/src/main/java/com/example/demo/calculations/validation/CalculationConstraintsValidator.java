package com.example.demo.calculations.validation;

import com.example.demo.model.CalculationInputDto;
import com.example.demo.model.ProductConstraintsDto;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class CalculationConstraintsValidator {

    public void validate(CalculationInputDto input, ProductConstraintsDto constraints) {
        if (constraints == null) {
            return;
        }

        validateAmount(input.getAmount(), constraints);
        validateTerm(input.getTerm(), constraints);
        validateRate(input.getRate(), constraints);
    }

    private void validateAmount(BigDecimal amount, ProductConstraintsDto constraints) {
        if (amount == null) return;

        if (constraints.getMinAmount() != null && amount.compareTo(constraints.getMinAmount()) < 0) {
            throw new IllegalArgumentException("Amount " + amount + " is less than minimum " + constraints.getMinAmount());
        }
        if (constraints.getMaxAmount() != null && amount.compareTo(constraints.getMaxAmount()) > 0) {
            throw new IllegalArgumentException("Amount " + amount + " is greater than maximum " + constraints.getMaxAmount());
        }
    }

    private void validateTerm(Integer term, ProductConstraintsDto constraints) {
        if (term == null) return;

        if (constraints.getMinTerm() != null && term < constraints.getMinTerm()) {
            throw new IllegalArgumentException("Term " + term + " is less than minimum " + constraints.getMinTerm());
        }
        if (constraints.getMaxTerm() != null && term > constraints.getMaxTerm()) {
            throw new IllegalArgumentException("Term " + term + " is greater than maximum " + constraints.getMaxTerm());
        }
    }

    private void validateRate(BigDecimal rate, ProductConstraintsDto constraints) {
        if (rate == null) return;

        if (constraints.getMinRate() != null && rate.compareTo(constraints.getMinRate()) < 0) {
            throw new IllegalArgumentException("Rate " + rate + " is less than minimum " + constraints.getMinRate());
        }
        if (constraints.getMaxRate() != null && rate.compareTo(constraints.getMaxRate()) > 0) {
            throw new IllegalArgumentException("Rate " + rate + " is greater than maximum " + constraints.getMaxRate());
        }
    }
}