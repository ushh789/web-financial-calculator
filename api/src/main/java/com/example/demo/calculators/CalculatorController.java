package com.example.demo.calculators;

import com.example.demo.api.CalculatorsApiDelegate;
import com.example.demo.model.CalculatorDto;
import com.example.demo.model.CalculatorVersionDto;
import com.example.demo.model.CreateCalculatorRequest;
import com.example.demo.model.CreateVersionRequest;
import com.example.demo.model.PageCalculatorDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CalculatorController implements CalculatorsApiDelegate {

    private final CalculatorService calculatorService;

    @Override
    public ResponseEntity<PageCalculatorDto> getAllCalculators(Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CalculatorDto> result = calculatorService.findAll(pageable);
        
        PageCalculatorDto response = new PageCalculatorDto();
        response.setContent(result.getContent());
        response.setTotalElements(result.getTotalElements());
        response.setTotalPages(result.getTotalPages());
        response.setSize(result.getSize());
        response.setNumber(result.getNumber());

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<CalculatorDto> getCalculatorById(UUID id) {
        return calculatorService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<List<CalculatorVersionDto>> getCalculatorVersions(UUID id) {
        List<CalculatorVersionDto> versions = calculatorService.getVersions(id);
        return ResponseEntity.ok(versions);
    }

    @Override
    public ResponseEntity<CalculatorDto> createCalculator(CreateCalculatorRequest createCalculatorRequest) {
        CalculatorDto created = calculatorService.createCalculator(createCalculatorRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Override
    public ResponseEntity<CalculatorVersionDto> addCalculatorVersion(UUID id, CreateVersionRequest createVersionRequest) {
        CalculatorVersionDto version = calculatorService.addVersion(id, createVersionRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(version);
    }
}