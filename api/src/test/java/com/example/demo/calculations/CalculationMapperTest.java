package com.example.demo.calculations;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.example.demo.common.CalculationResult;
import com.example.demo.common.DateTimeMapper;
import com.example.demo.model.CalculationDto;
import com.example.demo.model.CalculationInputDto;
import com.example.demo.model.CalculationScenarioDto;
import com.example.demo.model.PageCalculationDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class CalculationMapperTest {

    private CalculationMapperImpl mapper;

    @BeforeEach
    void setUp() {
        mapper = new CalculationMapperImpl();
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        ReflectionTestUtils.setField(mapper, "objectMapper", objectMapper);
        ReflectionTestUtils.setField(mapper, "dateTimeMapper", new DateTimeMapper());
    }

    @Test
    void toDto_calculation_maps_basic_fields() {
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID versionId = UUID.randomUUID();

        Calculation calculation = new Calculation();
        calculation.setId(id);
        calculation.setUserId(userId);
        calculation.setCalculatorVersionId(versionId);
        calculation.setCurrency("EUR");
        calculation.setCreatedAt(LocalDateTime.of(2024, 3, 15, 9, 0));

        CalculationDto dto = mapper.toDto(calculation);

        assertThat(dto.getId()).isEqualTo(id);
        assertThat(dto.getUserId()).isEqualTo(userId);
        assertThat(dto.getCalculatorVersionId()).isEqualTo(versionId);
        assertThat(dto.getCurrency()).isEqualTo("EUR");
        assertThat(dto.getCreatedAt()).isNotNull();
    }

    @Test
    void toDto_calculation_maps_selected_scenario_id() {
        UUID scenarioId = UUID.randomUUID();
        CalculationScenario scenario = new CalculationScenario();
        scenario.setId(scenarioId);

        Calculation calculation = new Calculation();
        calculation.setId(UUID.randomUUID());
        calculation.setUserId(UUID.randomUUID());
        calculation.setCalculatorVersionId(UUID.randomUUID());
        calculation.setSelectedScenario(scenario);

        CalculationDto dto = mapper.toDto(calculation);

        assertThat(dto.getSelectedScenarioId()).isEqualTo(scenarioId);
    }

    @Test
    void toDto_calculation_null_scenario_maps_null_selected_id() {
        Calculation calculation = new Calculation();
        calculation.setId(UUID.randomUUID());
        calculation.setUserId(UUID.randomUUID());
        calculation.setCalculatorVersionId(UUID.randomUUID());
        calculation.setSelectedScenario(null);

        CalculationDto dto = mapper.toDto(calculation);

        assertThat(dto.getSelectedScenarioId()).isNull();
    }

    @Test
    void toDto_calculation_returns_null_for_null() {
        assertThat(mapper.toDto((Calculation) null)).isNull();
    }

    @Test
    void toDto_scenario_maps_calculation_id() {
        UUID calcId = UUID.randomUUID();
        Calculation calculation = new Calculation();
        calculation.setId(calcId);

        CalculationScenario scenario = new CalculationScenario();
        scenario.setId(UUID.randomUUID());
        scenario.setCalculation(calculation);
        scenario.setScenarioName("Test Scenario");
        scenario.setCreatedAt(LocalDateTime.of(2024, 3, 15, 9, 0));

        CalculationScenarioDto dto = mapper.toDto(scenario);

        assertThat(dto.getCalculationId()).isEqualTo(calcId);
        assertThat(dto.getScenarioName()).isEqualTo("Test Scenario");
    }

    @Test
    void toDto_scenario_returns_null_for_null() {
        assertThat(mapper.toDto((CalculationScenario) null)).isNull();
    }

    @Test
    void toPageDto_wraps_page_correctly() {
        CalculationDto dto = new CalculationDto();
        PageCalculationDto page = mapper.toPageDto(new PageImpl<>(List.of(dto), PageRequest.of(0, 10), 25));

        assertThat(page.getContent()).containsExactly(dto);
        assertThat(page.getTotalElements()).isEqualTo(25);
        assertThat(page.getSize()).isEqualTo(10);
        assertThat(page.getNumber()).isEqualTo(0);
    }

    @Test
    void calculationResultToMap_converts_result_to_map() {
        CalculationResult result = new CalculationResult();

        Map<String, Object> map = mapper.calculationResultToMap(result);

        assertThat(map).isNotNull();
        assertThat(map).containsKey("cashFlows");
    }

    @Test
    void calculationResultToMap_returns_null_for_null() {
        assertThat(mapper.calculationResultToMap(null)).isNull();
    }

    @Test
    void mapToCalculationInputDto_converts_map_to_dto() {
        Map<String, Object> map = new HashMap<>();
        map.put("amount", 1000.0);
        map.put("term", 12);
        map.put("rate", 5.0);

        CalculationInputDto dto = mapper.mapToCalculationInputDto(map);

        assertThat(dto).isNotNull();
        assertThat(dto.getTerm()).isEqualTo(12);
    }

    @Test
    void mapToCalculationInputDto_returns_null_for_null() {
        assertThat(mapper.mapToCalculationInputDto(null)).isNull();
    }

    @Test
    void calculationInputDtoToMap_roundtrips_correctly() {
        CalculationInputDto original = new CalculationInputDto();
        original.setAmount(BigDecimal.valueOf(500));
        original.setTerm(6);
        original.setRate(BigDecimal.valueOf(3.5));
        original.setStartDate(LocalDate.of(2024, 6, 1));

        Map<String, Object> map = mapper.calculationInputDtoToMap(original);

        assertThat(map).containsKey("amount");
        assertThat(map).containsKey("term");
    }

    @Test
    void calculationInputDtoToMap_returns_null_for_null() {
        assertThat(mapper.calculationInputDtoToMap(null)).isNull();
    }
}
