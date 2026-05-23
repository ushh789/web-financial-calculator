package com.example.demo.calculations;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CalculationRepository extends JpaRepository<Calculation, UUID> {
    Page<Calculation> findAllByUserId(UUID userId, Pageable pageable);

    @EntityGraph(attributePaths = "selectedScenario")
    List<Calculation> findAllByIdIn(Collection<UUID> ids);
}