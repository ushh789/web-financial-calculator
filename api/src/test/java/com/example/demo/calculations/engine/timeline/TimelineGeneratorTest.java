package com.example.demo.calculations.engine.timeline;

import java.time.LocalDate;
import java.util.List;

import com.example.demo.common.Frequency;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class TimelineGeneratorTest {

    private TimelineGenerator generator;
    private static final LocalDate START = LocalDate.of(2024, 1, 1);

    @BeforeEach
    void setUp() {
        generator = new TimelineGenerator();
    }

    @Test
    void monthly_generates_correct_dates() {
        List<LocalDate> dates = generator.generateDates(START, 3, Frequency.MONTHLY);

        assertThat(dates).hasSize(3);
        assertThat(dates.get(0)).isEqualTo(LocalDate.of(2024, 2, 1));
        assertThat(dates.get(1)).isEqualTo(LocalDate.of(2024, 3, 1));
        assertThat(dates.get(2)).isEqualTo(LocalDate.of(2024, 4, 1));
    }

    @Test
    void quarterly_generates_correct_dates() {
        List<LocalDate> dates = generator.generateDates(START, 4, Frequency.QUARTERLY);

        assertThat(dates).hasSize(4);
        assertThat(dates.get(0)).isEqualTo(LocalDate.of(2024, 4, 1));
        assertThat(dates.get(3)).isEqualTo(LocalDate.of(2025, 1, 1));
    }

    @Test
    void annually_generates_correct_dates() {
        List<LocalDate> dates = generator.generateDates(START, 2, Frequency.ANNUALLY);

        assertThat(dates).hasSize(2);
        assertThat(dates.get(0)).isEqualTo(LocalDate.of(2025, 1, 1));
        assertThat(dates.get(1)).isEqualTo(LocalDate.of(2026, 1, 1));
    }

    @Test
    void single_period_returns_one_date() {
        List<LocalDate> dates = generator.generateDates(START, 1, Frequency.MONTHLY);

        assertThat(dates).hasSize(1);
        assertThat(dates.getFirst()).isEqualTo(LocalDate.of(2024, 2, 1));
    }

    @Test
    void zero_term_returns_empty_list() {
        List<LocalDate> dates = generator.generateDates(START, 0, Frequency.MONTHLY);

        assertThat(dates).isEmpty();
    }

    @Test
    void semi_annually_generates_correct_dates() {
        List<LocalDate> dates = generator.generateDates(START, 2, Frequency.SEMI_ANNUALLY);

        assertThat(dates).hasSize(2);
        assertThat(dates.get(0)).isEqualTo(LocalDate.of(2024, 7, 1));
        assertThat(dates.get(1)).isEqualTo(LocalDate.of(2025, 1, 1));
    }

    @Test
    void each_date_is_offset_from_previous_not_from_start() {
        List<LocalDate> dates = generator.generateDates(START, 12, Frequency.MONTHLY);

        assertThat(dates).hasSize(12);
        for (int i = 1; i < dates.size(); i++) {
            assertThat(dates.get(i)).isEqualTo(dates.get(i - 1).plusMonths(1));
        }
    }
}
