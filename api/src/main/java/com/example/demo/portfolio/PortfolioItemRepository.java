package com.example.demo.portfolio;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PortfolioItemRepository extends JpaRepository<PortfolioItem, UUID> {
    List<PortfolioItem> findAllByUserId(UUID userId);
    boolean existsByUserIdAndCalculationId(UUID userId, UUID calculationId);
    long deleteByUserIdAndCalculationId(UUID userId, UUID calculationId);
}
