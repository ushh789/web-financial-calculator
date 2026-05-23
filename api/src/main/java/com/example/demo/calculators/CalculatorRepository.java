package com.example.demo.calculators;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
interface CalculatorRepository extends JpaRepository<Calculator, UUID> {
    boolean existsByCode(String code);
}