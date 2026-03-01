package com.example.demo;

import com.example.demo.model.CreateCalculationRequest;
import com.example.demo.model.CreateCalculatorRequest;
import com.example.demo.model.CreateScenarioRequest;
import com.example.demo.model.CreateUserRequest;
import com.example.demo.users.Role;
import com.example.demo.users.RoleRepository;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class FullSystemIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private RoleRepository roleRepository;

    private static UUID userId;
    private static UUID calculatorId;
    private static UUID calculationId;
    private static UUID scenarioId;
    
    @BeforeAll
    void setup() {
        if (roleRepository.findByName("USER").isEmpty()) {
            Role role = new Role();
            role.setName("USER");
            roleRepository.save(role);
        }
    }

    @Test
    @Order(1)
    void shouldCreateUser() throws Exception {
        CreateUserRequest request = new CreateUserRequest()
                .username("testuser")
                .email("test@example.com")
                .firstName("Test")
                .lastName("User")
                .role("USER");

        MvcResult result = mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        userId = UUID.fromString(root.get("id").asText());
    }

    @Test
    @Order(2)
    void shouldCreateCalculator() throws Exception {
        Map<String, Object> uiSchema = Map.of("fields", List.of(Map.of("name", "amount")));
        Map<String, Object> metadata = Map.of("steps", List.of(Map.of("target", "monthlyInterest")));

        CreateCalculatorRequest request = new CreateCalculatorRequest()
                .code("simple-interest")
                .name("Simple Interest Calculator")
                .description("Calculates monthly interest payment")
                .algorithmMetadata(metadata)
                .uiSchema(uiSchema);

        MvcResult result = mockMvc.perform(post("/api/calculators")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        calculatorId = UUID.fromString(root.get("id").asText());
    }

    @Test
    @Order(3)
    void shouldCreateCalculation() throws Exception {
        Map<String, Object> inputData = Map.of("amount", 12000.0, "rate", 10.0);

        CreateCalculationRequest request = new CreateCalculationRequest()
                .userId(userId)
                .calculatorId(calculatorId)
                .inputData(inputData)
                .currency("USD");

        MvcResult result = mockMvc.perform(post("/api/calculations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.selectedScenarioId").isNotEmpty())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        calculationId = UUID.fromString(root.get("id").asText());
    }

    @Test
    @Order(4)
    void shouldAddScenario() throws Exception {
        Map<String, Object> inputData = Map.of("amount", 12000.0, "rate", 20.0);

        CreateScenarioRequest request = new CreateScenarioRequest()
                .scenarioName("High Rate Scenario")
                .scenarioInput(inputData);

        MvcResult result = mockMvc.perform(post("/api/calculations/" + calculationId + "/scenarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andReturn();
        
        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        scenarioId = UUID.fromString(root.get("id").asText());
    }

    @Test
    @Order(5)
    void shouldSelectScenario() throws Exception {
        mockMvc.perform(put("/api/calculations/" + calculationId + "/select-scenario/" + scenarioId))
                .andDo(print())
                .andExpect(status().isNoContent());
    }
}