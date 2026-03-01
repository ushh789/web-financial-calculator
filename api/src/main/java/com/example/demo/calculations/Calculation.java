package com.example.demo.calculations;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "calculations")
@Getter
@Setter
public class Calculation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "calculator_id", nullable = false)
    private UUID calculatorId;

    @Column(name = "calculator_version_id", nullable = false)
    private UUID calculatorVersionId;

    @Column(length = 3)
    private String currency;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_scenario_id")
    private CalculationScenario selectedScenario;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
