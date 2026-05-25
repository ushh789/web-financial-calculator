package com.example.demo;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.example.demo.common.Money;
import com.example.demo.model.AmortizationType;
import com.example.demo.model.CalculationInputDto;
import com.example.demo.model.DayCountConvention;
import com.example.demo.model.FinancialProductDefinitionDto;
import com.example.demo.model.Frequency;
import com.example.demo.model.InterestConfigDto;
import com.example.demo.model.InterestMethod;
import com.example.demo.model.ProductType;
import com.example.demo.model.RateType;
import com.example.demo.model.RepaymentConfigDto;

public final class TestFixtures {

    private TestFixtures() {
    }

    public static CalculationInputDto defaultInput() {
        CalculationInputDto dto = new CalculationInputDto();
        dto.setAmount(new BigDecimal("1000"));
        dto.setRate(new BigDecimal("5"));
        dto.setTerm(3);
        dto.setStartDate(LocalDate.of(2024, 1, 1));
        return dto;
    }

    public static FinancialProductDefinitionDto depositProduct() {
        return product(ProductType.DEPOSIT, InterestMethod.SIMPLE, AmortizationType.BULLET);
    }

    public static FinancialProductDefinitionDto loanProduct(AmortizationType strategy) {
        return product(ProductType.LOAN, InterestMethod.SIMPLE, strategy);
    }

    public static FinancialProductDefinitionDto product(
            ProductType type, InterestMethod interestMethod, AmortizationType amortization) {
        InterestConfigDto interest = new InterestConfigDto(
                interestMethod, DayCountConvention.ACTUAL_365, RateType.FIXED);
        RepaymentConfigDto repayment = new RepaymentConfigDto(amortization, Frequency.MONTHLY);
        return new FinancialProductDefinitionDto(type, interest, repayment);
    }
}
