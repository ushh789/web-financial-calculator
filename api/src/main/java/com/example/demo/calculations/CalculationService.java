package com.example.demo.calculations;

import com.example.demo.calculations.engine.StandardFinancialProductEngine;
import com.example.demo.calculations.validation.CalculationConstraintsValidator;
import com.example.demo.common.CalculationResult;
import com.example.demo.model.CalculationDto;
import com.example.demo.model.CalculationInputDto;
import com.example.demo.model.CalculationScenarioDto;
import com.example.demo.model.CreateCalculationRequest;
import com.example.demo.model.CreateScenarioRequest;
import com.example.demo.model.CalculatorVersionDto;
import com.example.demo.model.FinancialProductDefinitionDto;
import com.example.demo.calculators.CalculatorService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalculationService {

    private final CalculationRepository calculationRepository;
    private final CalculationScenarioRepository scenarioRepository;
    private final CalculationMapper mapper;
    private final CalculatorService calculatorService;
    private final StandardFinancialProductEngine standardFinancialProductEngine;
    private final ObjectMapper objectMapper;
    private final CalculationConstraintsValidator constraintsValidator;

    @Transactional(readOnly = true)
    public Page<CalculationDto> findAllByUserId(UUID userId, Pageable pageable) {
        return calculationRepository.findAllByUserId(userId, pageable)
                .map(mapper::toDto);
    }

    @Transactional(readOnly = true)
    public CalculationDto findById(UUID id) {
        return calculationRepository.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Calculation not found: " + id));
    }

    @Transactional
    public CalculationDto createCalculation(CreateCalculationRequest request) {
        CalculatorVersionDto version = calculatorService.findLatestVersion(request.getCalculatorId())
                .orElseThrow(() -> new IllegalArgumentException("Calculator version not found"));

        FinancialProductDefinitionDto productDefinition = version.getAlgorithmMetadata();
        CalculationInputDto inputData = request.getInputData();

        // Validate Constraints
        constraintsValidator.validate(inputData, productDefinition.getConstraints());

        Calculation calculation = new Calculation();
        calculation.setUserId(request.getUserId());
        calculation.setCalculatorId(request.getCalculatorId());
        calculation.setCalculatorVersionId(version.getId());
        calculation.setCurrency(request.getCurrency());
        
        calculation = calculationRepository.save(calculation);

        // Convert DTO to Map for Entity storage
        Map<String, Object> inputDataMap = objectMapper.convertValue(inputData, Map.class);

        CalculationScenario defaultScenario = new CalculationScenario();
        defaultScenario.setCalculation(calculation);
        defaultScenario.setScenarioName("Default");
        defaultScenario.setScenarioInput(inputDataMap);
        
        CalculationResult calculationResult = standardFinancialProductEngine.generateSchedule(
            productDefinition,
            inputData
        );
        defaultScenario.setScenarioResult(calculationResult);
        
        defaultScenario = scenarioRepository.save(defaultScenario);

        calculation.setSelectedScenario(defaultScenario);
        calculationRepository.save(calculation);

        return mapper.toDto(calculation);
    }

    @Transactional
    public CalculationScenarioDto addScenario(UUID calculationId, CreateScenarioRequest request) {
        Calculation calculation = calculationRepository.findById(calculationId)
                .orElseThrow(() -> new IllegalArgumentException("Calculation not found"));

        CalculatorVersionDto version = calculatorService.findLatestVersion(calculation.getCalculatorId())
                .orElseThrow(() -> new IllegalArgumentException("Calculator version not found"));
        
        FinancialProductDefinitionDto productDefinition = version.getAlgorithmMetadata();
        CalculationInputDto inputData = request.getScenarioInput();

        // Validate Constraints
        constraintsValidator.validate(inputData, productDefinition.getConstraints());

        Map<String, Object> inputDataMap = objectMapper.convertValue(inputData, Map.class);

        CalculationScenario scenario = new CalculationScenario();
        scenario.setCalculation(calculation);
        scenario.setScenarioName(request.getScenarioName());
        scenario.setScenarioInput(inputDataMap);
        
        CalculationResult calculationResult = standardFinancialProductEngine.generateSchedule(
            productDefinition,
            inputData
        );
        scenario.setScenarioResult(calculationResult);

        return mapper.toDto(scenarioRepository.save(scenario));
    }
    
    @Transactional(readOnly = true)
    public List<CalculationScenarioDto> getScenarios(UUID calculationId) {
        return scenarioRepository.findAllByCalculationId(calculationId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void selectScenario(UUID calculationId, UUID scenarioId) {
        Calculation calculation = calculationRepository.findById(calculationId)
                .orElseThrow(() -> new IllegalArgumentException("Calculation not found"));
        
        CalculationScenario scenario = scenarioRepository.findById(scenarioId)
                .orElseThrow(() -> new IllegalArgumentException("Scenario not found"));
        
        if (!scenario.getCalculation().getId().equals(calculationId)) {
            throw new IllegalArgumentException("Scenario does not belong to this calculation");
        }

        calculation.setSelectedScenario(scenario);
        calculationRepository.save(calculation);
    }
}