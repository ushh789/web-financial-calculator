package com.example.demo.calculators;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.example.demo.model.CalculatorDto;
import com.example.demo.model.CalculatorVersionDto;
import com.example.demo.model.CreateCalculatorRequest;
import com.example.demo.model.CreateVersionRequest;
import com.example.demo.model.FinancialProductDefinitionDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalculatorServiceTest {

    @Mock
    private CalculatorRepository calculatorRepository;
    @Mock
    private CalculatorVersionRepository versionRepository;
    @Mock
    private CalculatorMapper mapper;

    private CalculatorService service;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
        service = new CalculatorService(calculatorRepository, versionRepository, mapper, objectMapper);
    }

    @Test
    void findAll_returns_mapped_page() {
        Pageable pageable = PageRequest.of(0, 10);
        Calculator calc = new Calculator();
        CalculatorDto dto = new CalculatorDto();
        when(calculatorRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(calc)));
        when(mapper.toDto(calc)).thenReturn(dto);

        Page<CalculatorDto> result = service.findAll(pageable);

        assertThat(result.getContent()).containsExactly(dto);
    }

    @Test
    void findById_found_returns_mapped_dto() {
        UUID id = UUID.randomUUID();
        Calculator calc = new Calculator();
        CalculatorDto dto = new CalculatorDto();
        when(calculatorRepository.findById(id)).thenReturn(Optional.of(calc));
        when(mapper.toDto(calc)).thenReturn(dto);

        Optional<CalculatorDto> result = service.findById(id);

        assertThat(result).contains(dto);
    }

    @Test
    void findById_not_found_returns_empty() {
        UUID id = UUID.randomUUID();
        when(calculatorRepository.findById(id)).thenReturn(Optional.empty());

        Optional<CalculatorDto> result = service.findById(id);

        assertThat(result).isEmpty();
    }

    @Test
    void createCalculator_duplicate_code_throws() {
        CreateCalculatorRequest request = new CreateCalculatorRequest("CODE", "Name", new FinancialProductDefinitionDto());
        when(calculatorRepository.existsByCode("CODE")).thenReturn(true);

        assertThatThrownBy(() -> service.createCalculator(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");

        verify(calculatorRepository, never()).save(any());
    }

    @Test
    void createCalculator_success_saves_calculator_and_version() {
        CreateCalculatorRequest request = new CreateCalculatorRequest("CODE", "Name", new FinancialProductDefinitionDto());
        Calculator savedCalc = new Calculator();
        savedCalc.setId(UUID.randomUUID());
        CalculatorDto dto = new CalculatorDto();

        when(calculatorRepository.existsByCode("CODE")).thenReturn(false);
        when(mapper.toEntity(request)).thenReturn(new Calculator());
        when(calculatorRepository.save(any())).thenReturn(savedCalc);
        when(mapper.toDto(savedCalc)).thenReturn(dto);

        CalculatorDto result = service.createCalculator(request);

        assertThat(result).isEqualTo(dto);
        verify(versionRepository).save(any());

        ArgumentCaptor<CalculatorVersion> versionCaptor = ArgumentCaptor.forClass(CalculatorVersion.class);
        verify(versionRepository).save(versionCaptor.capture());
        assertThat(versionCaptor.getValue().getVersion()).isEqualTo(1);
    }

    @Test
    void addVersion_not_found_throws() {
        UUID id = UUID.randomUUID();
        when(calculatorRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.addVersion(id, new CreateVersionRequest()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void addVersion_increments_version_number() {
        UUID calcId = UUID.randomUUID();
        Calculator calc = new Calculator();
        calc.setId(calcId);

        CalculatorVersion existing = new CalculatorVersion();
        existing.setVersion(3);
        CalculatorVersion saved = new CalculatorVersion();
        CalculatorVersionDto dto = new CalculatorVersionDto();

        when(calculatorRepository.findById(calcId)).thenReturn(Optional.of(calc));
        when(versionRepository.findAllByCalculatorIdOrderByVersionDesc(calcId)).thenReturn(List.of(existing));
        when(versionRepository.save(any())).thenReturn(saved);
        when(mapper.toDto(saved)).thenReturn(dto);

        CreateVersionRequest request = new CreateVersionRequest();

        service.addVersion(calcId, request);

        ArgumentCaptor<CalculatorVersion> captor = ArgumentCaptor.forClass(CalculatorVersion.class);
        verify(versionRepository).save(captor.capture());
        assertThat(captor.getValue().getVersion()).isEqualTo(4);
    }

    @Test
    void addVersion_first_version_gets_number_1_when_no_existing() {
        UUID calcId = UUID.randomUUID();
        Calculator calc = new Calculator();
        CalculatorVersion saved = new CalculatorVersion();
        CalculatorVersionDto dto = new CalculatorVersionDto();

        when(calculatorRepository.findById(calcId)).thenReturn(Optional.of(calc));
        when(versionRepository.findAllByCalculatorIdOrderByVersionDesc(calcId)).thenReturn(List.of());
        when(versionRepository.save(any())).thenReturn(saved);
        when(mapper.toDto(saved)).thenReturn(dto);

        service.addVersion(calcId, new CreateVersionRequest());

        ArgumentCaptor<CalculatorVersion> captor = ArgumentCaptor.forClass(CalculatorVersion.class);
        verify(versionRepository).save(captor.capture());
        assertThat(captor.getValue().getVersion()).isEqualTo(1);
    }

    @Test
    void getVersions_throws_when_calculator_not_found() {
        UUID id = UUID.randomUUID();
        when(calculatorRepository.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> service.getVersions(id))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void getVersions_returns_mapped_list() {
        UUID calcId = UUID.randomUUID();
        CalculatorVersion version = new CalculatorVersion();
        CalculatorVersionDto dto = new CalculatorVersionDto();

        when(calculatorRepository.existsById(calcId)).thenReturn(true);
        when(versionRepository.findAllByCalculatorIdOrderByVersionDesc(calcId)).thenReturn(List.of(version));
        when(mapper.toDto(version)).thenReturn(dto);

        List<CalculatorVersionDto> result = service.getVersions(calcId);

        assertThat(result).containsExactly(dto);
    }

    @Test
    void findVersionById_found() {
        UUID versionId = UUID.randomUUID();
        CalculatorVersion version = new CalculatorVersion();
        CalculatorVersionDto dto = new CalculatorVersionDto();
        when(versionRepository.findById(versionId)).thenReturn(Optional.of(version));
        when(mapper.toDto(version)).thenReturn(dto);

        Optional<CalculatorVersionDto> result = service.findVersionById(versionId);

        assertThat(result).contains(dto);
    }

    @Test
    void findLatestVersion_returns_first_from_ordered_list() {
        UUID calcId = UUID.randomUUID();
        CalculatorVersion v2 = new CalculatorVersion();
        v2.setVersion(2);
        CalculatorVersion v1 = new CalculatorVersion();
        v1.setVersion(1);
        CalculatorVersionDto dto = new CalculatorVersionDto();

        when(versionRepository.findAllByCalculatorIdOrderByVersionDesc(calcId)).thenReturn(List.of(v2, v1));
        when(mapper.toDto(v2)).thenReturn(dto);

        Optional<CalculatorVersionDto> result = service.findLatestVersion(calcId);

        assertThat(result).contains(dto);
    }

    @Test
    void findLatestVersion_returns_empty_when_no_versions() {
        UUID calcId = UUID.randomUUID();
        when(versionRepository.findAllByCalculatorIdOrderByVersionDesc(calcId)).thenReturn(List.of());

        Optional<CalculatorVersionDto> result = service.findLatestVersion(calcId);

        assertThat(result).isEmpty();
    }
}
