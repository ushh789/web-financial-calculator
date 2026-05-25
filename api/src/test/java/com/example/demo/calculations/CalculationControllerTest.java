package com.example.demo.calculations;

import java.util.List;
import java.util.UUID;

import com.example.demo.model.CalculationDto;
import com.example.demo.model.CalculationScenarioDto;
import com.example.demo.model.CreateCalculationRequest;
import com.example.demo.model.CreateScenarioRequest;
import com.example.demo.model.PageCalculationDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalculationControllerTest {

    @Mock
    private CalculationService calculationService;
    @Mock
    private CalculationMapper calculationMapper;

    private CalculationController controller;

    @BeforeEach
    void setUp() {
        controller = new CalculationController(calculationService, calculationMapper);
    }

    @Test
    void getCalculations_returns_200_with_page() {
        UUID userId = UUID.randomUUID();
        CalculationDto dto = new CalculationDto();
        PageCalculationDto pageDto = new PageCalculationDto();
        when(calculationService.findAllByUserId(any(), any())).thenReturn(new PageImpl<>(List.of(dto)));
        when(calculationMapper.toPageDto(any())).thenReturn(pageDto);

        ResponseEntity<PageCalculationDto> response = controller.getCalculations(userId, 0, 10);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(pageDto);
    }

    @Test
    void createCalculation_returns_201_created() {
        CreateCalculationRequest request = new CreateCalculationRequest();
        CalculationDto created = new CalculationDto();
        when(calculationService.createCalculation(request)).thenReturn(created);

        ResponseEntity<CalculationDto> response = controller.createCalculation(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isSameAs(created);
    }

    @Test
    void getScenarios_returns_200_with_list() {
        UUID id = UUID.randomUUID();
        CalculationScenarioDto dto = new CalculationScenarioDto();
        when(calculationService.getScenarios(id)).thenReturn(List.of(dto));

        ResponseEntity<List<CalculationScenarioDto>> response = controller.getScenarios(id);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(dto);
    }

    @Test
    void addScenario_returns_201_created() {
        UUID id = UUID.randomUUID();
        CreateScenarioRequest request = new CreateScenarioRequest();
        CalculationScenarioDto dto = new CalculationScenarioDto();
        when(calculationService.addScenario(id, request)).thenReturn(dto);

        ResponseEntity<CalculationScenarioDto> response = controller.addScenario(id, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isSameAs(dto);
    }

    @Test
    void selectScenario_returns_204_no_content() {
        UUID id = UUID.randomUUID();
        UUID scenarioId = UUID.randomUUID();
        doNothing().when(calculationService).selectScenario(id, scenarioId);

        ResponseEntity<Void> response = controller.selectScenario(id, scenarioId);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(calculationService).selectScenario(id, scenarioId);
    }
}
