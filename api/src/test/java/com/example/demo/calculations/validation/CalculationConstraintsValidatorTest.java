package com.example.demo.calculations.validation;

import java.math.BigDecimal;

import com.example.demo.model.CalculationInputDto;
import com.example.demo.model.ProductConstraintsDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CalculationConstraintsValidatorTest {

    private CalculationConstraintsValidator validator;

    @BeforeEach
    void setUp() {
        validator = new CalculationConstraintsValidator();
    }

    private CalculationInputDto input(double amount, int term, double rate) {
        CalculationInputDto dto = new CalculationInputDto();
        dto.setAmount(BigDecimal.valueOf(amount));
        dto.setTerm(term);
        dto.setRate(BigDecimal.valueOf(rate));
        return dto;
    }

    private ProductConstraintsDto constraints(double minAmt, double maxAmt, int minTerm, int maxTerm, double minRate, double maxRate) {
        ProductConstraintsDto c = new ProductConstraintsDto();
        c.setMinAmount(BigDecimal.valueOf(minAmt));
        c.setMaxAmount(BigDecimal.valueOf(maxAmt));
        c.setMinTerm(minTerm);
        c.setMaxTerm(maxTerm);
        c.setMinRate(BigDecimal.valueOf(minRate));
        c.setMaxRate(BigDecimal.valueOf(maxRate));
        return c;
    }

    @Test
    void valid_input_does_not_throw() {
        assertThatNoException()
                .isThrownBy(() -> validator.validate(input(500, 12, 5), constraints(100, 1000, 1, 24, 1, 10)));
    }

    @Test
    void null_constraints_does_not_throw() {
        assertThatNoException()
                .isThrownBy(() -> validator.validate(input(500, 12, 5), null));
    }

    @Test
    void amount_below_minimum_throws() {
        assertThatThrownBy(() -> validator.validate(input(50, 12, 5), constraints(100, 1000, 1, 24, 1, 10)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("less than minimum");
    }

    @Test
    void amount_above_maximum_throws() {
        assertThatThrownBy(() -> validator.validate(input(2000, 12, 5), constraints(100, 1000, 1, 24, 1, 10)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("greater than maximum");
    }

    @Test
    void term_below_minimum_throws() {
        assertThatThrownBy(() -> validator.validate(input(500, 0, 5), constraints(100, 1000, 1, 24, 1, 10)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("less than minimum");
    }

    @Test
    void term_above_maximum_throws() {
        assertThatThrownBy(() -> validator.validate(input(500, 36, 5), constraints(100, 1000, 1, 24, 1, 10)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("greater than maximum");
    }

    @Test
    void rate_below_minimum_throws() {
        assertThatThrownBy(() -> validator.validate(input(500, 12, 0.5), constraints(100, 1000, 1, 24, 1, 10)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("less than minimum");
    }

    @Test
    void rate_above_maximum_throws() {
        assertThatThrownBy(() -> validator.validate(input(500, 12, 15), constraints(100, 1000, 1, 24, 1, 10)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("greater than maximum");
    }

    @Test
    void amount_at_boundary_does_not_throw() {
        assertThatNoException()
                .isThrownBy(() -> validator.validate(input(100, 12, 5), constraints(100, 1000, 1, 24, 1, 10)));
    }

    @Test
    void null_amount_skips_amount_validation() {
        CalculationInputDto dto = new CalculationInputDto();
        dto.setTerm(12);
        dto.setRate(BigDecimal.valueOf(5));
        assertThatNoException()
                .isThrownBy(() -> validator.validate(dto, constraints(100, 1000, 1, 24, 1, 10)));
    }
}
