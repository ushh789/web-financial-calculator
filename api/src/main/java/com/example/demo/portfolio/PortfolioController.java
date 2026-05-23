package com.example.demo.portfolio;

import java.time.LocalDate;
import java.util.UUID;

import com.example.demo.api.PortfolioApiDelegate;
import com.example.demo.model.PortfolioDto;
import com.example.demo.users.User;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PortfolioController implements PortfolioApiDelegate {

    private final PortfolioService portfolioService;

    @Override
    public ResponseEntity<PortfolioDto> getPortfolio(LocalDate from, LocalDate to) {
        return ResponseEntity.ok(portfolioService.buildPortfolio(currentUserId(), from, to));
    }

    @Override
    public ResponseEntity<Void> removeFromPortfolio(UUID calculationId) {
        portfolioService.removeFromPortfolio(currentUserId(), calculationId);
        return ResponseEntity.noContent().build();
    }

    private UUID currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        return user.getId();
    }
}
