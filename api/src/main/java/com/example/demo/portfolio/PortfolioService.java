package com.example.demo.portfolio;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import com.example.demo.calculations.Calculation;
import com.example.demo.calculations.CalculationRepository;
import com.example.demo.common.CashFlow;
import com.example.demo.model.PortfolioCurrencyBucketDto;
import com.example.demo.model.PortfolioDto;
import com.example.demo.model.PortfolioItemDto;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final PortfolioItemRepository portfolioItemRepository;
    private final CalculationRepository calculationRepository;

    @Transactional(readOnly = true)
    public PortfolioDto buildPortfolio(UUID userId, LocalDate from, LocalDate to) {
        LocalDate resolvedFrom = from != null ? from : YearMonth.now().atDay(1);
        LocalDate resolvedTo = to != null ? to : YearMonth.now().atEndOfMonth();

        if (resolvedFrom.isAfter(resolvedTo)) {
            throw new IllegalArgumentException("'from' must not be after 'to'");
        }

        List<PortfolioItem> portfolioItems = portfolioItemRepository.findAllByUserId(userId);
        List<UUID> calculationIds = portfolioItems.stream()
                .map(PortfolioItem::getCalculationId)
                .toList();

        List<Calculation> calculations = calculationIds.isEmpty()
                ? List.of()
                : calculationRepository.findAllByIdIn(calculationIds);

        List<PortfolioItemDto> allItems = calculations.stream()
                .filter(c -> c.getSelectedScenario() != null)
                .flatMap(c -> c.getSelectedScenario().getScenarioResult().cashFlows().stream()
                        .filter(cf -> !cf.date().isBefore(resolvedFrom) && !cf.date().isAfter(resolvedTo))
                        .map(cf -> toItemDto(cf, c.getId(), c.getSelectedScenario().getId())))
                .toList();

        Map<String, List<PortfolioItemDto>> byCurrency = allItems.stream()
                .collect(Collectors.groupingBy(PortfolioItemDto::getCurrency));

        List<PortfolioCurrencyBucketDto> buckets = byCurrency.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> toBucket(e.getKey(), e.getValue()))
                .toList();

        PortfolioDto dto = new PortfolioDto();
        dto.setUserId(userId);
        dto.setFrom(resolvedFrom);
        dto.setTo(resolvedTo);
        dto.setBuckets(buckets);
        return dto;
    }

    @Transactional
    public void removeFromPortfolio(UUID userId, UUID calculationId) {
        long deleted = portfolioItemRepository.deleteByUserIdAndCalculationId(userId, calculationId);
        if (deleted == 0) {
            throw new EntityNotFoundException("Calculation not found in portfolio");
        }
    }

    private PortfolioItemDto toItemDto(CashFlow cf, UUID calculationId, UUID scenarioId) {
        PortfolioItemDto dto = new PortfolioItemDto();
        dto.setDate(cf.date());
        dto.setType(PortfolioItemDto.TypeEnum.valueOf(cf.type().name()));
        dto.setAmount(cf.totalAmount().amount());
        dto.setCurrency(cf.totalAmount().currencyCode());
        dto.setDescription(cf.description());
        dto.setPrincipal(cf.breakdown().principal().amount());
        dto.setInterest(cf.breakdown().interest().amount());
        dto.setFee(cf.breakdown().fee().amount());
        dto.setCalculationId(calculationId);
        dto.setScenarioId(scenarioId);
        return dto;
    }

    private PortfolioCurrencyBucketDto toBucket(String currency, List<PortfolioItemDto> items) {
        List<PortfolioItemDto> sorted = items.stream()
                .sorted(Comparator.comparing(PortfolioItemDto::getDate))
                .toList();

        BigDecimal totalInflow = items.stream()
                .filter(i -> i.getType() == PortfolioItemDto.TypeEnum.INFLOW)
                .map(PortfolioItemDto::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalOutflow = items.stream()
                .filter(i -> i.getType() == PortfolioItemDto.TypeEnum.OUTFLOW)
                .map(PortfolioItemDto::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        PortfolioCurrencyBucketDto bucket = new PortfolioCurrencyBucketDto();
        bucket.setCurrency(currency);
        bucket.setTotalInflow(totalInflow);
        bucket.setTotalOutflow(totalOutflow);
        bucket.setNetCashFlow(totalInflow.subtract(totalOutflow));
        bucket.setItems(sorted);
        return bucket;
    }
}
