package com.example.demo.calculations;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
interface CalculationScenarioRepository extends JpaRepository<CalculationScenario, UUID> {
    List<CalculationScenario> findAllByCalculationId(UUID calculationId);
}