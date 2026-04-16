package com.example.demo.calculations;

import com.example.demo.api.CalculationsApiDelegate;
import com.example.demo.model.CalculationDto;
import com.example.demo.model.CalculationScenarioDto;
import com.example.demo.model.CreateCalculationRequest;
import com.example.demo.model.CreateScenarioRequest;
import com.example.demo.model.PageCalculationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CalculationController implements CalculationsApiDelegate {

    private final CalculationService calculationService;
    private final CalculationMapper calculationMapper;

    @Override
    public ResponseEntity<CalculationDto> getCalculationById(UUID id) {
        CalculationDto dto = calculationService.findById(id);
        return ResponseEntity.ok(dto);
    }

    @Override
    public ResponseEntity<PageCalculationDto> getCalculations(UUID userId, Integer page, Integer size) {
        Page<CalculationDto> result = calculationService.findAllByUserId(userId, PageRequest.of(page, size));
        PageCalculationDto response = calculationMapper.toPageDto(result);
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<CalculationDto> createCalculation(CreateCalculationRequest createCalculationRequest) {
        CalculationDto created = calculationService.createCalculation(createCalculationRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Override
    public ResponseEntity<List<CalculationScenarioDto>> getScenarios(UUID id) {
        List<CalculationScenarioDto> scenarios = calculationService.getScenarios(id);
        return ResponseEntity.ok(scenarios);
    }

    @Override
    public ResponseEntity<CalculationScenarioDto> addScenario(UUID id, CreateScenarioRequest createScenarioRequest) {
        CalculationScenarioDto scenario = calculationService.addScenario(id, createScenarioRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(scenario);
    }

    @Override
    public ResponseEntity<Void> selectScenario(UUID id, UUID scenarioId) {
        calculationService.selectScenario(id, scenarioId);
        return ResponseEntity.noContent().build();
    }
}
