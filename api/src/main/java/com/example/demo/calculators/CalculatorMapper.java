package com.example.demo.calculators;

import com.example.demo.common.DateTimeMapper;
import com.example.demo.model.CalculatorDto;
import com.example.demo.model.CalculatorVersionDto;
import com.example.demo.model.CreateCalculatorRequest;
import com.example.demo.model.FinancialProductDefinitionDto;
import com.example.demo.model.PageCalculatorDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;

import java.util.Map;

@Mapper(componentModel = "spring", uses = {DateTimeMapper.class})
public abstract class CalculatorMapper {

    @Autowired
    private ObjectMapper objectMapper;

    public abstract CalculatorDto toDto(Calculator calculator);

    @Mapping(source = "calculator.id", target = "calculatorId")
    public abstract CalculatorVersionDto toDto(CalculatorVersion version);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    public abstract Calculator toEntity(CreateCalculatorRequest request);

    public PageCalculatorDto toPageDto(Page<CalculatorDto> page) {
        PageCalculatorDto pageDto = new PageCalculatorDto();
        pageDto.setContent(page.getContent());
        pageDto.setTotalElements(page.getTotalElements());
        pageDto.setTotalPages(page.getTotalPages());
        pageDto.setSize(page.getSize());
        pageDto.setNumber(page.getNumber());
        return pageDto;
    }

    /**
     * Converts Map (from Entity) to FinancialProductDefinitionDto (for DTO).
     */
    public FinancialProductDefinitionDto mapToFinancialProductDefinitionDto(Map<String, Object> map) {
        if (map == null) {
            return null;
        }
        return objectMapper.convertValue(map, FinancialProductDefinitionDto.class);
    }

    /**
     * Converts FinancialProductDefinitionDto (from Request) to Map (for Entity).
     */
    public Map<String, Object> financialProductDefinitionDtoToMap(FinancialProductDefinitionDto dto) {
        if (dto == null) {
            return null;
        }
        return objectMapper.convertValue(dto, Map.class);
    }
}
