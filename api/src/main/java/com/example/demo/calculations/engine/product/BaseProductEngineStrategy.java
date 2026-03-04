package com.example.demo.calculations.engine.product;

import com.example.demo.calculations.engine.timeline.TimelineGenerator;
import com.example.demo.common.Frequency;
import com.example.demo.model.CalculationInputDto;
import com.example.demo.model.ProductDefaultsDto;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@RequiredArgsConstructor
public abstract class BaseProductEngineStrategy implements ProductEngineStrategy {
    protected static final String DEFAULT_CURRENCY = "USD";
    protected static final int DEFAULT_SCALE = 2;
    protected static final RoundingMode DEFAULT_ROUNDING_MODE = RoundingMode.HALF_UP;

    protected final TimelineGenerator timelineGenerator;

    protected final BigDecimal resolveAmount(CalculationInputDto input) {
        if (input.getAmount() == null) {
            throw new IllegalArgumentException("Amount is required");
        }
        return input.getAmount();
    }

    protected final BigDecimal resolveRate(CalculationInputDto input, ProductDefaultsDto defaults) {
        BigDecimal rate;
        if (defaults != null && defaults.getFixedRate() != null) {
            rate = defaults.getFixedRate();
        } else if (input.getRate() != null) {
            rate = input.getRate();
        } else {
            throw new IllegalArgumentException("Rate is required");
        }
        return rate.divide(BigDecimal.valueOf(100));
    }

    protected final int resolveTerm(CalculationInputDto input) {
        if (input.getTerm() != null) {
            return input.getTerm();
        }
        throw new IllegalArgumentException("Term is required");
    }

    protected final String resolveCurrency(ProductDefaultsDto defaults) {
        return (defaults != null && defaults.getCurrency() != null) ? defaults.getCurrency().getValue() : DEFAULT_CURRENCY;
    }

    protected final int resolveScale(ProductDefaultsDto defaults) {
        return (defaults != null && defaults.getRoundingScale() != null) ? defaults.getRoundingScale() : DEFAULT_SCALE;
    }

    protected final RoundingMode resolveRoundingMode(ProductDefaultsDto defaults) {
        return (defaults != null && defaults.getRoundingMode() != null) 
                ? RoundingMode.valueOf(defaults.getRoundingMode().getValue()) 
                : DEFAULT_ROUNDING_MODE;
    }
    
    protected List<LocalDate> generateDates(LocalDate startDate, int term, Frequency frequency) {
        return timelineGenerator.generateDates(startDate, term, frequency);
    }
}