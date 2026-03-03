package com.example.demo.calculators;

import com.example.demo.model.CalculatorDto;
import com.example.demo.model.CalculatorVersionDto;
import com.example.demo.model.CreateCalculatorRequest;
import com.example.demo.model.CreateVersionRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalculatorService {

    private final CalculatorRepository calculatorRepository;
    private final CalculatorVersionRepository versionRepository;
    private final CalculatorMapper mapper;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Page<CalculatorDto> findAll(Pageable pageable) {
        return calculatorRepository.findAll(pageable)
                .map(mapper::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<CalculatorDto> findById(UUID id) {
        return calculatorRepository.findById(id)
                .map(mapper::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<CalculatorDto> findByCode(String code) {
        return calculatorRepository.findByCode(code)
                .map(mapper::toDto);
    }

    @Transactional
    public CalculatorDto createCalculator(CreateCalculatorRequest request) {
        if (calculatorRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Calculator with code " + request.getCode() + " already exists");
        }
        
        Calculator calculator = mapper.toEntity(request);
        calculator = calculatorRepository.save(calculator);

        // Convert DTOs to Maps for Entity
        Map<String, Object> metadataMap = objectMapper.convertValue(request.getAlgorithmMetadata(), Map.class);
        Map<String, Object> uiSchemaMap = objectMapper.convertValue(request.getUiSchema(), Map.class);

        CalculatorVersion version = new CalculatorVersion();
        version.setCalculator(calculator);
        version.setVersion(1);
        version.setAlgorithmMetadata(metadataMap);
        version.setUiSchema(uiSchemaMap);
        versionRepository.save(version);

        return mapper.toDto(calculator);
    }

    @Transactional
    public CalculatorVersionDto addVersion(UUID calculatorId, CreateVersionRequest request) {
        Calculator calculator = calculatorRepository.findById(calculatorId)
                .orElseThrow(() -> new IllegalArgumentException("Calculator not found"));

        int nextVersion = versionRepository.findAllByCalculatorIdOrderByVersionDesc(calculatorId)
                .stream()
                .findFirst()
                .map(v -> v.getVersion() + 1)
                .orElse(1);

        // Convert DTOs to Maps
        Map<String, Object> metadataMap = objectMapper.convertValue(request.getAlgorithmMetadata(), Map.class);
        Map<String, Object> uiSchemaMap = objectMapper.convertValue(request.getUiSchema(), Map.class);

        CalculatorVersion version = new CalculatorVersion();
        version.setCalculator(calculator);
        version.setVersion(nextVersion);
        version.setAlgorithmMetadata(metadataMap);
        version.setUiSchema(uiSchemaMap);

        return mapper.toDto(versionRepository.save(version));
    }

    @Transactional(readOnly = true)
    public List<CalculatorVersionDto> getVersions(UUID calculatorId) {
        if (!calculatorRepository.existsById(calculatorId)) {
            throw new IllegalArgumentException("Calculator not found");
        }
        return versionRepository.findAllByCalculatorIdOrderByVersionDesc(calculatorId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<CalculatorVersionDto> findLatestVersion(UUID calculatorId) {
        return versionRepository.findAllByCalculatorIdOrderByVersionDesc(calculatorId)
                .stream()
                .findFirst()
                .map(mapper::toDto);
    }
}