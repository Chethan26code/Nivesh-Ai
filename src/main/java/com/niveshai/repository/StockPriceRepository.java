package com.niveshai.repository;

import com.niveshai.model.StockPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StockPriceRepository extends JpaRepository<StockPrice, Long> {

    List<StockPrice> findByStockIdOrderByDateAsc(Long stockId);

    List<StockPrice> findByStockIdAndDateBetweenOrderByDateAsc(Long stockId, LocalDate start, LocalDate end);

    @Query("SELECT sp FROM StockPrice sp WHERE sp.stock.id = :stockId ORDER BY sp.date DESC LIMIT 1")
    Optional<StockPrice> findLatestByStockId(@Param("stockId") Long stockId);

    @Query("SELECT sp FROM StockPrice sp WHERE sp.stock.id = :stockId AND sp.date <= :date ORDER BY sp.date DESC LIMIT 1")
    Optional<StockPrice> findByStockIdAndDateLessThanEqual(@Param("stockId") Long stockId, @Param("date") LocalDate date);

    @Query("SELECT sp FROM StockPrice sp WHERE sp.stock.id = :stockId ORDER BY sp.date DESC")
    List<StockPrice> findRecentByStockId(@Param("stockId") Long stockId);

    @Query("SELECT DISTINCT sp.stock.id FROM StockPrice sp")
    List<Long> findDistinctStockIds();
}
