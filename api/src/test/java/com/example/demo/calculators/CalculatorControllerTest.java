package com.example.demo.calculators;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.example.demo.model.CalculatorDto;
import com.example.demo.model.CalculatorVersionDto;
import com.example.demo.model.CreateCalculatorRequest;
import com.example.demo.model.CreateVersionRequest;
import com.example.demo.model.PageCalculatorDto;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalculatorControllerTest {

    @Mock
    private CalculatorService calculatorService;
    @Mock
    private CalculatorMapper calculatorMapper;

    private CalculatorController controller;

    @BeforeEach
    void setUp() {
        controller = new CalculatorController(calculatorService, calculatorMapper);
    }

    @Test
    void getAllCalculators_returns_200_with_page() {
        CalculatorDto dto = new CalculatorDto();
        PageCalculatorDto pageDto = new PageCalculatorDto();
        when(calculatorService.findAll(any())).thenReturn(new PageImpl<>(List.of(dto)));
        when(calculatorMapper.toPageDto(any())).thenReturn(pageDto);

        ResponseEntity<PageCalculatorDto> response = controller.getAllCalculators(0, 10);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(pageDto);
    }

    @Test
    void getCalculatorById_found_returns_200() {
        UUID id = UUID.randomUUID();
        CalculatorDto dto = new CalculatorDto();
        when(calculatorService.findById(id)).thenReturn(Optional.of(dto));

        ResponseEntity<CalculatorDto> response = controller.getCalculatorById(id);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(dto);
    }

    @Test
    void getCalculatorById_not_found_returns_404() {
        UUID id = UUID.randomUUID();
        when(calculatorService.findById(id)).thenReturn(Optional.empty());

        ResponseEntity<CalculatorDto> response = controller.getCalculatorById(id);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getCalculatorVersions_returns_200_with_list() {
        UUID id = UUID.randomUUID();
        CalculatorVersionDto dto = new CalculatorVersionDto();
        when(calculatorService.getVersions(id)).thenReturn(List.of(dto));

        ResponseEntity<List<CalculatorVersionDto>> response = controller.getCalculatorVersions(id);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(dto);
    }

    @Test
    void createCalculator_returns_201_created() {
        CreateCalculatorRequest request = new CreateCalculatorRequest();
        CalculatorDto created = new CalculatorDto();
        when(calculatorService.createCalculator(request)).thenReturn(created);

        ResponseEntity<CalculatorDto> response = controller.createCalculator(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isSameAs(created);
    }

    @Test
    void addCalculatorVersion_returns_201_created() {
        UUID id = UUID.randomUUID();
        CreateVersionRequest request = new CreateVersionRequest();
        CalculatorVersionDto dto = new CalculatorVersionDto();
        when(calculatorService.addVersion(id, request)).thenReturn(dto);

        ResponseEntity<CalculatorVersionDto> response = controller.addCalculatorVersion(id, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isSameAs(dto);
    }
}
