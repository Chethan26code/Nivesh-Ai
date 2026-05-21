package com.niveshai.service;

import com.niveshai.model.*;
import com.niveshai.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final StockRepository stockRepository;
    private final StockPriceRepository stockPriceRepository;
    private final UserRepository userRepository;

    public PortfolioService(PortfolioRepository portfolioRepository, StockRepository stockRepository,
                           StockPriceRepository stockPriceRepository, UserRepository userRepository) {
        this.portfolioRepository = portfolioRepository;
        this.stockRepository = stockRepository;
        this.stockPriceRepository = stockPriceRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Map<String, Object> buyStock(Long userId, Long stockId, Integer quantity, LocalDate date) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new RuntimeException("Stock not found"));

        StockPrice priceOnDate = stockPriceRepository.findByStockIdAndDateLessThanEqual(stockId, date)
                .orElseThrow(() -> new RuntimeException("No price data available for date: " + date));

        Portfolio portfolio = new Portfolio(user, stock, quantity, priceOnDate.getClose(), priceOnDate.getDate());
        portfolioRepository.save(portfolio);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", portfolio.getId());
        result.put("stock", stock.getSymbol());
        result.put("quantity", quantity);
        result.put("buyPrice", priceOnDate.getClose());
        result.put("buyDate", priceOnDate.getDate().toString());
        result.put("totalCost", Math.round(priceOnDate.getClose() * quantity * 100.0) / 100.0);
        return result;
    }

    @Transactional
    public Map<String, Object> sellStock(Long userId, Long portfolioId, Integer quantity, LocalDate date) {
        Portfolio position = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Position not found"));

        if (!position.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        if (position.getStatus() != Portfolio.TradeStatus.OPEN) {
            throw new RuntimeException("Position already closed");
        }
        if (quantity > position.getQuantity()) {
            throw new RuntimeException("Cannot sell more than held quantity");
        }

        StockPrice priceOnDate = stockPriceRepository.findByStockIdAndDateLessThanEqual(
                        position.getStock().getId(), date)
                .orElseThrow(() -> new RuntimeException("No price data for date: " + date));

        double sellPrice = priceOnDate.getClose();
        double pnl = (sellPrice - position.getBuyPrice()) * quantity;

        if (quantity.equals(position.getQuantity())) {
            // Full sell
            position.setSellPrice(sellPrice);
            position.setSellDate(priceOnDate.getDate());
            position.setStatus(Portfolio.TradeStatus.CLOSED);
            portfolioRepository.save(position);
        } else {
            // Partial sell — reduce quantity and create closed entry
            position.setQuantity(position.getQuantity() - quantity);
            portfolioRepository.save(position);

            Portfolio closedPosition = new Portfolio(position.getUser(), position.getStock(),
                    quantity, position.getBuyPrice(), position.getBuyDate());
            closedPosition.setSellPrice(sellPrice);
            closedPosition.setSellDate(priceOnDate.getDate());
            closedPosition.setStatus(Portfolio.TradeStatus.CLOSED);
            portfolioRepository.save(closedPosition);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("stock", position.getStock().getSymbol());
        result.put("quantity", quantity);
        result.put("sellPrice", sellPrice);
        result.put("sellDate", priceOnDate.getDate().toString());
        result.put("buyPrice", position.getBuyPrice());
        result.put("pnl", Math.round(pnl * 100.0) / 100.0);
        result.put("pnlPercent", Math.round((sellPrice / position.getBuyPrice() - 1) * 10000.0) / 100.0);
        return result;
    }

    public List<Map<String, Object>> getHoldings(Long userId) {
        List<Portfolio> openPositions = portfolioRepository.findByUserIdAndStatus(userId, Portfolio.TradeStatus.OPEN);
        List<Map<String, Object>> holdings = new ArrayList<>();

        for (Portfolio p : openPositions) {
            StockPrice latest = stockPriceRepository.findLatestByStockId(p.getStock().getId()).orElse(null);
            double currentPrice = latest != null ? latest.getClose() : p.getBuyPrice();
            double pnl = (currentPrice - p.getBuyPrice()) * p.getQuantity();
            double pnlPct = (currentPrice / p.getBuyPrice() - 1) * 100;

            Map<String, Object> holding = new LinkedHashMap<>();
            holding.put("id", p.getId());
            holding.put("stockId", p.getStock().getId());
            holding.put("symbol", p.getStock().getSymbol());
            holding.put("name", p.getStock().getName());
            holding.put("sector", p.getStock().getSector());
            holding.put("quantity", p.getQuantity());
            holding.put("buyPrice", p.getBuyPrice());
            holding.put("buyDate", p.getBuyDate().toString());
            holding.put("currentPrice", currentPrice);
            holding.put("totalInvested", Math.round(p.getBuyPrice() * p.getQuantity() * 100.0) / 100.0);
            holding.put("currentValue", Math.round(currentPrice * p.getQuantity() * 100.0) / 100.0);
            holding.put("pnl", Math.round(pnl * 100.0) / 100.0);
            holding.put("pnlPercent", Math.round(pnlPct * 100.0) / 100.0);
            holdings.add(holding);
        }

        return holdings;
    }

    public List<Map<String, Object>> getTradeHistory(Long userId) {
        List<Portfolio> all = portfolioRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> trades = new ArrayList<>();

        for (Portfolio p : all) {
            StockPrice latest = stockPriceRepository.findLatestByStockId(p.getStock().getId()).orElse(null);
            double currentPrice = latest != null ? latest.getClose() : p.getBuyPrice();

            Map<String, Object> trade = new LinkedHashMap<>();
            trade.put("id", p.getId());
            trade.put("symbol", p.getStock().getSymbol());
            trade.put("name", p.getStock().getName());
            trade.put("quantity", p.getQuantity());
            trade.put("buyPrice", p.getBuyPrice());
            trade.put("buyDate", p.getBuyDate().toString());
            trade.put("status", p.getStatus().name());

            if (p.getStatus() == Portfolio.TradeStatus.CLOSED) {
                trade.put("sellPrice", p.getSellPrice());
                trade.put("sellDate", p.getSellDate().toString());
                double pnl = (p.getSellPrice() - p.getBuyPrice()) * p.getQuantity();
                trade.put("pnl", Math.round(pnl * 100.0) / 100.0);
            } else {
                double pnl = (currentPrice - p.getBuyPrice()) * p.getQuantity();
                trade.put("currentPrice", currentPrice);
                trade.put("unrealizedPnl", Math.round(pnl * 100.0) / 100.0);
            }
            trades.add(trade);
        }
        return trades;
    }

    public Map<String, Object> getSummary(Long userId) {
        List<Map<String, Object>> holdings = getHoldings(userId);

        double totalInvested = holdings.stream().mapToDouble(h -> (double) h.get("totalInvested")).sum();
        double totalValue = holdings.stream().mapToDouble(h -> (double) h.get("currentValue")).sum();
        double totalPnl = holdings.stream().mapToDouble(h -> (double) h.get("pnl")).sum();
        double totalPnlPct = totalInvested > 0 ? (totalValue / totalInvested - 1) * 100 : 0;

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalInvested", Math.round(totalInvested * 100.0) / 100.0);
        summary.put("totalValue", Math.round(totalValue * 100.0) / 100.0);
        summary.put("totalPnl", Math.round(totalPnl * 100.0) / 100.0);
        summary.put("totalPnlPercent", Math.round(totalPnlPct * 100.0) / 100.0);
        summary.put("holdingsCount", holdings.size());
        summary.put("holdings", holdings);
        return summary;
    }

    public Map<String, Double> getSectorAllocation(Long userId) {
        List<Map<String, Object>> holdings = getHoldings(userId);
        double totalValue = holdings.stream().mapToDouble(h -> (double) h.get("currentValue")).sum();

        if (totalValue == 0) return Map.of();

        return holdings.stream()
                .collect(Collectors.groupingBy(
                        h -> (String) h.get("sector"),
                        Collectors.summingDouble(h -> (double) h.get("currentValue"))
                ))
                .entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> Math.round(e.getValue() / totalValue * 10000.0) / 100.0
                ));
    }

    public Map<String, List<Map<String, Object>>> getTopMovers(Long userId) {
        List<Map<String, Object>> holdings = getHoldings(userId);

        List<Map<String, Object>> sorted = holdings.stream()
                .sorted(Comparator.comparingDouble(h -> -(double) ((Map<String, Object>) h).get("pnlPercent")))
                .collect(Collectors.toList());

        List<Map<String, Object>> gainers = sorted.stream()
                .filter(h -> (double) h.get("pnl") > 0)
                .limit(5)
                .collect(Collectors.toList());

        List<Map<String, Object>> losers = sorted.stream()
                .filter(h -> (double) h.get("pnl") < 0)
                .sorted(Comparator.comparingDouble(h -> (double) ((Map<String, Object>) h).get("pnlPercent")))
                .limit(5)
                .collect(Collectors.toList());

        Map<String, List<Map<String, Object>>> result = new LinkedHashMap<>();
        result.put("gainers", gainers);
        result.put("losers", losers);
        return result;
    }
}
