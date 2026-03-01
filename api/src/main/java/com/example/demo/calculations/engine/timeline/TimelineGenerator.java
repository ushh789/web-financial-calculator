package com.example.demo.calculations.engine.timeline;

import com.example.demo.common.Frequency;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class TimelineGenerator {

    public List<LocalDate> generateDates(LocalDate startDate, int term, Frequency frequency) {
        List<LocalDate> dates = new ArrayList<>();
        // Start date is usually not a payment date, but the start of the period
        // But for schedule we often need the payment dates.
        // Let's assume we generate payment dates (end of periods).
        
        LocalDate currentDate = startDate;
        for (int i = 0; i < term; i++) {
            currentDate = currentDate.plus(frequency.getPeriod());
            dates.add(currentDate);
        }
        return dates;
    }
}