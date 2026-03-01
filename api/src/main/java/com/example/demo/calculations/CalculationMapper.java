package com.example.demo.calculations;

import com.example.demo.common.CalculationResult;
import com.example.demo.common.DateTimeMapper;
import com.example.demo.model.CalculationDto;
import com.example.demo.model.CalculationScenarioDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;

@Mapper(componentModel = "spring", uses = {DateTimeMapper.class})
public abstract class CalculationMapper {

    @Autowired
    private ObjectMapper objectMapper;

    @Mapping(source = "selectedScenario.id", target = "selectedScenarioId")
    public abstract CalculationDto toDto(Calculation calculation);

    @Mapping(source = "calculation.id", target = "calculationId")
    public abstract CalculationScenarioDto toDto(CalculationScenario scenario);

    /**
     * This method will be automatically used by MapStruct to convert
     * CalculationResult to Map<String, Object>.
     */
    public Map<String, Object> calculationResultToMap(CalculationResult result) {
        if (result == null) {
            return null;
        }
        return objectMapper.convertValue(result, Map.class);
    }
}