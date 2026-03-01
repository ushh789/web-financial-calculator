package com.example.demo.common;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Component
public class DateTimeMapper {

    public OffsetDateTime toOffsetDateTime(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return null;
        }
        // assuming all server times are in UTC
        return localDateTime.atOffset(ZoneOffset.UTC);
    }
}