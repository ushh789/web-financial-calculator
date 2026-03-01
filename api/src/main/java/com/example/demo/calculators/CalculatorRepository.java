package com.example.demo.calculators;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
interface CalculatorRepository extends JpaRepository<Calculator, UUID> {
    Optional<Calculator> findByCode(String code);
    boolean existsByCode(String code);
}