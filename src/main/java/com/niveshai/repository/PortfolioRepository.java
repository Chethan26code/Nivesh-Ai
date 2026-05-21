package com.niveshai.repository;

import com.niveshai.model.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    List<Portfolio> findByUserIdAndStatus(Long userId, Portfolio.TradeStatus status);

    List<Portfolio> findByUserId(Long userId);

    List<Portfolio> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT p FROM Portfolio p WHERE p.user.id = :userId AND p.stock.id = :stockId AND p.status = 'OPEN'")
    List<Portfolio> findOpenPositionsByUserAndStock(@Param("userId") Long userId, @Param("stockId") Long stockId);

    @Query("SELECT COUNT(DISTINCT p.stock.id) FROM Portfolio p WHERE p.user.id = :userId AND p.status = 'OPEN'")
    Integer countDistinctHoldingsByUserId(@Param("userId") Long userId);
}
