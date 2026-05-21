package com.niveshai.controller;

import com.niveshai.model.Stock;
import com.niveshai.model.StockPrice;
import com.niveshai.repository.StockPriceRepository;
import com.niveshai.repository.StockRepository;
import com.niveshai.service.SignalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stocks")
public class StockController {

    private final StockRepository stockRepository;
    private final StockPriceRepository stockPriceRepository;
    private final SignalService signalService;

    public StockController(StockRepository stockRepository, StockPriceRepository stockPriceRepository,
                          SignalService signalService) {
        this.stockRepository = stockRepository;
        this.stockPriceRepository = stockPriceRepository;
        this.signalService = signalService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllStocks() {
        List<Stock> stocks = stockRepository.findAll();
        List<Map<String, Object>> result = stocks.stream().map(stock -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", stock.getId());
            map.put("symbol", stock.getSymbol());
            map.put("name", stock.getName());
            map.put("sector", stock.getSector());
            map.put("riskLevel", stock.getRiskLevel().name());

            StockPrice latest = stockPriceRepository.findLatestByStockId(stock.getId()).orElse(null);
            if (latest != null) {
                map.put("latestPrice", latest.getClose());
                map.put("latestDate", latest.getDate().toString());
            }

            try {
                Map<String, Object> signal = signalService.generateSignal(stock.getId());
                map.put("signal", signal.get("signal"));
                map.put("signalScore", signal.get("score"));
            } catch (Exception e) {
                map.put("signal", "HOLD");
                map.put("signalScore", 0);
            }

            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getStock(@PathVariable Long id) {
        Stock stock = stockRepository.findById(id).orElse(null);
        if (stock == null) return ResponseEntity.notFound().build();

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", stock.getId());
        map.put("symbol", stock.getSymbol());
        map.put("name", stock.getName());
        map.put("sector", stock.getSector());
        map.put("riskLevel", stock.getRiskLevel().name());

        try {
            Map<String, Object> signal = signalService.generateSignal(stock.getId());
            map.put("signal", signal);
        } catch (Exception e) {
            map.put("signal", Map.of("signal", "HOLD", "score", 0));
        }

        return ResponseEntity.ok(map);
    }

    @GetMapping("/{id}/prices")
    public ResponseEntity<List<Map<String, Object>>> getStockPrices(@PathVariable Long id,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        List<StockPrice> prices;
        if (from != null && to != null) {
            prices = stockPriceRepository.findByStockIdAndDateBetweenOrderByDateAsc(
                    id, java.time.LocalDate.parse(from), java.time.LocalDate.parse(to));
        } else {
            prices = stockPriceRepository.findByStockIdOrderByDateAsc(id);
        }

        List<Map<String, Object>> result = prices.stream().map(p -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("date", p.getDate().toString());
            map.put("open", p.getOpen());
            map.put("high", p.getHigh());
            map.put("low", p.getLow());
            map.put("close", p.getClose());
            map.put("volume", p.getVolume());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
