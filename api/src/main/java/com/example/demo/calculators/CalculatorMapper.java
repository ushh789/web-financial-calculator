package com.example.demo.calculators;

import com.example.demo.common.DateTimeMapper;
import com.example.demo.model.CalculatorDto;
import com.example.demo.model.CalculatorVersionDto;
import com.example.demo.model.CreateCalculatorRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {DateTimeMapper.class})
public interface CalculatorMapper {

    CalculatorDto toDto(Calculator calculator);

    @Mapping(source = "calculator.id", target = "calculatorId")
    CalculatorVersionDto toDto(CalculatorVersion version);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Calculator toEntity(CreateCalculatorRequest request);
}