package com.example.demo.calculators;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
interface CalculatorVersionRepository extends JpaRepository<CalculatorVersion, UUID> {
    List<CalculatorVersion> findAllByCalculatorIdOrderByVersionDesc(UUID calculatorId);
}