package com.example.demo.calculations;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
interface CalculationRepository extends JpaRepository<Calculation, UUID> {
    Page<Calculation> findAllByUserId(UUID userId, Pageable pageable);

    Page<Calculation> findAllByCalculatorId(UUID calculatorId, Pageable pageable);
}