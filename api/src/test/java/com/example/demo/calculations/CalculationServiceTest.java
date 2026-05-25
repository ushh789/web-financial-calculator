package com.example.demo.calculations;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.example.demo.TestFixtures;
import com.example.demo.calculations.engine.FinancialProductEngine;
import com.example.demo.calculations.validation.CalculationConstraintsValidator;
import com.example.demo.calculators.CalculatorService;
import com.example.demo.common.CalculationResult;
import com.example.demo.model.CalculationDto;
import com.example.demo.model.CalculationInputDto;
import com.example.demo.model.CalculationScenarioDto;
import com.example.demo.model.CalculatorVersionDto;
import com.example.demo.model.CreateCalculationRequest;
import com.example.demo.model.CreateScenarioRequest;
import com.example.demo.model.FinancialProductDefinitionDto;
import com.example.demo.portfolio.PortfolioItemRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalculationServiceTest {

    @Mock
    private CalculationRepository calculationRepository;
    @Mock
    private CalculationScenarioRepository scenarioRepository;
    @Mock
    private CalculationMapper mapper;
    @Mock
    private CalculatorService calculatorService;
    @Mock
    private FinancialProductEngine financialProductEngine;
    @Mock
    private CalculationConstraintsValidator constraintsValidator;
    @Mock
    private PortfolioItemRepository portfolioItemRepository;

    private CalculationService service;

    @BeforeEach
    void setUp() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        service = new CalculationService(
                calculationRepository, scenarioRepository, mapper,
                calculatorService, financialProductEngine,
                objectMapper, constraintsValidator, portfolioItemRepository);
    }

    @Test
    void findAllByUserId_returns_mapped_page() {
        UUID userId = UUID.randomUUID();
        Calculation calc = new Calculation();
        CalculationDto dto = new CalculationDto();
        when(calculationRepository.findAllByUserId(userId, PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(calc)));
        when(mapper.toDto(calc)).thenReturn(dto);

        Page<CalculationDto> result = service.findAllByUserId(userId, PageRequest.of(0, 10));

        assertThat(result.getContent()).containsExactly(dto);
    }

    @Test
    void createCalculation_throws_when_no_version_found() {
        UUID calcId = UUID.randomUUID();
        CreateCalculationRequest request = new CreateCalculationRequest(
                UUID.randomUUID(), calcId, new CalculationInputDto(BigDecimal.valueOf(1000)));
        when(calculatorService.findLatestVersion(calcId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.createCalculation(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("version not found");
    }

    @Test
    void createCalculation_validates_constraints_and_saves() {
        UUID calcId = UUID.randomUUID();
        CalculationInputDto inputData = TestFixtures.defaultInput();
        FinancialProductDefinitionDto productDef = TestFixtures.depositProduct();

        CalculatorVersionDto version = new CalculatorVersionDto();
        version.setId(UUID.randomUUID());
        version.setAlgorithmMetadata(productDef);

        CreateCalculationRequest request = new CreateCalculationRequest(
                UUID.randomUUID(), calcId, inputData);

        Calculation savedCalc = new Calculation();
        savedCalc.setId(UUID.randomUUID());
        CalculationScenario savedScenario = new CalculationScenario();
        CalculationDto dto = new CalculationDto();

        when(calculatorService.findLatestVersion(calcId)).thenReturn(Optional.of(version));
        doNothing().when(constraintsValidator).validate(any(), any());
        when(calculationRepository.save(any())).thenReturn(savedCalc);
        when(financialProductEngine.generateSchedule(any(), any())).thenReturn(new CalculationResult());
        when(scenarioRepository.save(any())).thenReturn(savedScenario);
        when(mapper.toDto(savedCalc)).thenReturn(dto);

        CalculationDto result = service.createCalculation(request);

        assertThat(result).isEqualTo(dto);
        verify(constraintsValidator).validate(any(), any());
        verify(financialProductEngine).generateSchedule(any(), any());
        verify(scenarioRepository).save(any());
    }

    @Test
    void addScenario_throws_when_calculation_not_found() {
        UUID calcId = UUID.randomUUID();
        when(calculationRepository.findById(calcId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.addScenario(calcId, new CreateScenarioRequest(new CalculationInputDto(BigDecimal.ONE))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Calculation not found");
    }

    @Test
    void addScenario_validates_and_saves_scenario() {
        UUID calcId = UUID.randomUUID();
        Calculation calculation = new Calculation();
        calculation.setId(calcId);
        calculation.setCalculatorVersionId(UUID.randomUUID());

        FinancialProductDefinitionDto productDef = TestFixtures.depositProduct();
        CalculatorVersionDto version = new CalculatorVersionDto();
        version.setAlgorithmMetadata(productDef);

        CalculationInputDto input = TestFixtures.defaultInput();
        CreateScenarioRequest request = new CreateScenarioRequest(input);
        request.setScenarioName("Alt Scenario");

        CalculationScenario savedScenario = new CalculationScenario();
        CalculationScenarioDto dto = new CalculationScenarioDto();

        when(calculationRepository.findById(calcId)).thenReturn(Optional.of(calculation));
        when(calculatorService.findVersionById(calculation.getCalculatorVersionId())).thenReturn(Optional.of(version));
        doNothing().when(constraintsValidator).validate(any(), any());
        when(financialProductEngine.generateSchedule(any(), any())).thenReturn(new CalculationResult());
        when(scenarioRepository.save(any())).thenReturn(savedScenario);
        when(mapper.toDto(savedScenario)).thenReturn(dto);

        CalculationScenarioDto result = service.addScenario(calcId, request);

        assertThat(result).isEqualTo(dto);
        verify(constraintsValidator).validate(any(), any());
    }

    @Test
    void getScenarios_returns_mapped_list() {
        UUID calcId = UUID.randomUUID();
        CalculationScenario scenario = new CalculationScenario();
        CalculationScenarioDto dto = new CalculationScenarioDto();
        when(scenarioRepository.findAllByCalculationId(calcId)).thenReturn(List.of(scenario));
        when(mapper.toDto(scenario)).thenReturn(dto);

        List<CalculationScenarioDto> result = service.getScenarios(calcId);

        assertThat(result).containsExactly(dto);
    }

    @Test
    void selectScenario_throws_when_calculation_not_found() {
        UUID calcId = UUID.randomUUID();
        UUID scenarioId = UUID.randomUUID();
        when(calculationRepository.findById(calcId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.selectScenario(calcId, scenarioId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Calculation not found");
    }

    @Test
    void selectScenario_throws_when_scenario_belongs_to_different_calculation() {
        UUID calcId = UUID.randomUUID();
        UUID scenarioId = UUID.randomUUID();

        Calculation calculation = new Calculation();
        calculation.setId(calcId);
        calculation.setUserId(UUID.randomUUID());

        CalculationScenario scenario = new CalculationScenario();
        Calculation otherCalc = new Calculation();
        otherCalc.setId(UUID.randomUUID());
        scenario.setCalculation(otherCalc);

        when(calculationRepository.findById(calcId)).thenReturn(Optional.of(calculation));
        when(scenarioRepository.findById(scenarioId)).thenReturn(Optional.of(scenario));

        assertThatThrownBy(() -> service.selectScenario(calcId, scenarioId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("does not belong");
    }

    @Test
    void selectScenario_creates_portfolio_item_when_not_exists() {
        UUID calcId = UUID.randomUUID();
        UUID scenarioId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Calculation calculation = new Calculation();
        calculation.setId(calcId);
        calculation.setUserId(userId);

        CalculationScenario scenario = new CalculationScenario();
        scenario.setCalculation(calculation);

        when(calculationRepository.findById(calcId)).thenReturn(Optional.of(calculation));
        when(scenarioRepository.findById(scenarioId)).thenReturn(Optional.of(scenario));
        when(calculationRepository.save(any())).thenReturn(calculation);
        when(portfolioItemRepository.existsByUserIdAndCalculationId(userId, calcId)).thenReturn(false);

        service.selectScenario(calcId, scenarioId);

        verify(portfolioItemRepository).save(any());
    }

    @Test
    void selectScenario_does_not_create_portfolio_item_when_already_exists() {
        UUID calcId = UUID.randomUUID();
        UUID scenarioId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Calculation calculation = new Calculation();
        calculation.setId(calcId);
        calculation.setUserId(userId);

        CalculationScenario scenario = new CalculationScenario();
        scenario.setCalculation(calculation);

        when(calculationRepository.findById(calcId)).thenReturn(Optional.of(calculation));
        when(scenarioRepository.findById(scenarioId)).thenReturn(Optional.of(scenario));
        when(calculationRepository.save(any())).thenReturn(calculation);
        when(portfolioItemRepository.existsByUserIdAndCalculationId(userId, calcId)).thenReturn(true);

        service.selectScenario(calcId, scenarioId);

        verify(portfolioItemRepository, never()).save(any());
    }
}
