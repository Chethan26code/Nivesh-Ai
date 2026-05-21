package com.niveshai.repository;

import com.niveshai.model.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {
    Optional<Stock> findBySymbol(String symbol);
    List<Stock> findBySector(String sector);
    List<Stock> findByRiskLevel(Stock.RiskLevel riskLevel);
    List<Stock> findBySectorAndRiskLevel(String sector, Stock.RiskLevel riskLevel);
    boolean existsBySymbol(String symbol);
}
