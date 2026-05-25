package com.example.demo.calculators;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.example.demo.common.DateTimeMapper;
import com.example.demo.model.AmortizationType;
import com.example.demo.model.CalculatorDto;
import com.example.demo.model.CalculatorVersionDto;
import com.example.demo.model.CreateCalculatorRequest;
import com.example.demo.model.DayCountConvention;
import com.example.demo.model.FinancialProductDefinitionDto;
import com.example.demo.model.Frequency;
import com.example.demo.model.InterestConfigDto;
import com.example.demo.model.InterestMethod;
import com.example.demo.model.PageCalculatorDto;
import com.example.demo.model.ProductType;
import com.example.demo.model.RateType;
import com.example.demo.model.RepaymentConfigDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.data.domain.PageImpl;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class CalculatorMapperTest {

    private CalculatorMapperImpl mapper;

    @BeforeEach
    void setUp() {
        mapper = new CalculatorMapperImpl();
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        ReflectionTestUtils.setField(mapper, "objectMapper", objectMapper);
        ReflectionTestUtils.setField(mapper, "dateTimeMapper", new DateTimeMapper());
    }

    @Test
    void toDto_maps_calculator_fields() {
        Calculator calc = new Calculator();
        UUID id = UUID.randomUUID();
        calc.setId(id);
        calc.setCode("LOAN_01");
        calc.setName("Loan Calculator");
        calc.setDescription("A loan calc");
        calc.setActive(true);
        calc.setCreatedAt(LocalDateTime.of(2024, 1, 15, 10, 0));

        CalculatorDto dto = mapper.toDto(calc);

        assertThat(dto.getId()).isEqualTo(id);
        assertThat(dto.getCode()).isEqualTo("LOAN_01");
        assertThat(dto.getName()).isEqualTo("Loan Calculator");
        assertThat(dto.getDescription()).isEqualTo("A loan calc");
        assertThat(dto.getActive()).isTrue();
        assertThat(dto.getCreatedAt()).isNotNull();
    }

    @Test
    void toDto_calculator_returns_null_for_null() {
        assertThat(mapper.toDto((Calculator) null)).isNull();
    }

    @Test
    void toDto_version_maps_calculator_id() {
        UUID calcId = UUID.randomUUID();
        Calculator calc = new Calculator();
        calc.setId(calcId);

        CalculatorVersion version = new CalculatorVersion();
        UUID versionId = UUID.randomUUID();
        version.setId(versionId);
        version.setCalculator(calc);
        version.setVersion(2);

        CalculatorVersionDto dto = mapper.toDto(version);

        assertThat(dto.getId()).isEqualTo(versionId);
        assertThat(dto.getCalculatorId()).isEqualTo(calcId);
        assertThat(dto.getVersion()).isEqualTo(2);
    }

    @Test
    void toDto_version_returns_null_for_null() {
        assertThat(mapper.toDto((CalculatorVersion) null)).isNull();
    }

    @Test
    void toEntity_maps_request_fields_ignoring_id_active_createdAt() {
        FinancialProductDefinitionDto meta = new FinancialProductDefinitionDto(
                ProductType.DEPOSIT,
                new InterestConfigDto(InterestMethod.SIMPLE, DayCountConvention.ACTUAL_365, RateType.FIXED),
                new RepaymentConfigDto(AmortizationType.BULLET, Frequency.MONTHLY));

        CreateCalculatorRequest request = new CreateCalculatorRequest("CODE", "Name", meta);
        request.setDescription("desc");

        Calculator entity = mapper.toEntity(request);

        assertThat(entity.getCode()).isEqualTo("CODE");
        assertThat(entity.getName()).isEqualTo("Name");
        assertThat(entity.getDescription()).isEqualTo("desc");
        assertThat(entity.getId()).isNull();
    }

    @Test
    void toPageDto_wraps_page_correctly() {
        CalculatorDto dto = new CalculatorDto();
        PageCalculatorDto page = mapper.toPageDto(new PageImpl<>(List.of(dto), org.springframework.data.domain.PageRequest.of(1, 5), 20));

        assertThat(page.getContent()).containsExactly(dto);
        assertThat(page.getTotalElements()).isEqualTo(20);
        assertThat(page.getTotalPages()).isEqualTo(4);
        assertThat(page.getSize()).isEqualTo(5);
        assertThat(page.getNumber()).isEqualTo(1);
    }

    @Test
    void mapToFinancialProductDefinitionDto_converts_map_to_dto() {
        FinancialProductDefinitionDto original = new FinancialProductDefinitionDto(
                ProductType.LOAN,
                new InterestConfigDto(InterestMethod.SIMPLE, DayCountConvention.ACTUAL_365, RateType.FIXED),
                new RepaymentConfigDto(AmortizationType.ANNUITY, Frequency.MONTHLY));

        ObjectMapper om = new ObjectMapper();
        om.registerModule(new JavaTimeModule());
        java.util.Map<String, Object> map = om.convertValue(original, java.util.Map.class);

        FinancialProductDefinitionDto result = mapper.mapToFinancialProductDefinitionDto(map);

        assertThat(result.getType()).isEqualTo(ProductType.LOAN);
        assertThat(result.getInterest().getMethod()).isEqualTo(InterestMethod.SIMPLE);
    }

    @Test
    void mapToFinancialProductDefinitionDto_returns_null_for_null() {
        assertThat(mapper.mapToFinancialProductDefinitionDto(null)).isNull();
    }

    @Test
    void financialProductDefinitionDtoToMap_converts_dto_to_map() {
        FinancialProductDefinitionDto dto = new FinancialProductDefinitionDto(
                ProductType.DEPOSIT,
                new InterestConfigDto(InterestMethod.COMPOUND, DayCountConvention.THIRTY_360, RateType.FIXED),
                new RepaymentConfigDto(AmortizationType.BULLET, Frequency.QUARTERLY));

        java.util.Map<String, Object> map = mapper.financialProductDefinitionDtoToMap(dto);

        assertThat(map).containsKey("type");
        assertThat(map.get("type")).isEqualTo("DEPOSIT");
    }

    @Test
    void financialProductDefinitionDtoToMap_returns_null_for_null() {
        assertThat(mapper.financialProductDefinitionDtoToMap(null)).isNull();
    }
}
