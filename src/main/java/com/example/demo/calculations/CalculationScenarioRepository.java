package com.example.demo.calculations;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
interface CalculationScenarioRepository extends JpaRepository<CalculationScenario, UUID> {
    List<CalculationScenario> findAllByCalculationId(UUID calculationId);
}