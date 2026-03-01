package com.example.demo.calculators;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
interface CalculatorVersionRepository extends JpaRepository<CalculatorVersion, UUID> {
    List<CalculatorVersion> findAllByCalculatorIdOrderByVersionDesc(UUID calculatorId);

    Optional<CalculatorVersion> findByCalculatorIdAndVersion(UUID calculatorId, int version);
}