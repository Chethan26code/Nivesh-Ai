package com.niveshai.controller;

import com.niveshai.model.*;
import com.niveshai.repository.*;
import com.niveshai.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final StockRepository stockRepository;
    private final FinancialProfileRepository profileRepository;
    private final SignalService signalService;
    private final SuitabilityService suitabilityService;
    private final StockPriceRepository stockPriceRepository;

    public RecommendationController(StockRepository stockRepository,
                                     FinancialProfileRepository profileRepository,
                                     SignalService signalService,
                                     SuitabilityService suitabilityService,
                                     StockPriceRepository stockPriceRepository) {
        this.stockRepository = stockRepository;
        this.profileRepository = profileRepository;
        this.signalService = signalService;
        this.suitabilityService = suitabilityService;
        this.stockPriceRepository = stockPriceRepository;
    }

    @GetMapping
    public ResponseEntity<?> getRecommendations(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String risk,
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String signal) {

        FinancialProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        if (profile == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please complete your financial profile first"));
        }

        List<Stock> stocks = stockRepository.findAll();

        // Apply filters
        if (risk != null && !risk.isEmpty()) {
            Stock.RiskLevel riskLevel = Stock.RiskLevel.valueOf(risk.toUpperCase());
            stocks = stocks.stream().filter(s -> s.getRiskLevel() == riskLevel).collect(Collectors.toList());
        }
        if (sector != null && !sector.isEmpty()) {
            stocks = stocks.stream().filter(s -> s.getSector().equalsIgnoreCase(sector)).collect(Collectors.toList());
        }

        List<Map<String, Object>> recommendations = new ArrayList<>();

        for (Stock stock : stocks) {
            try {
                Map<String, Object> stockSignal = signalService.generateSignal(stock.getId());

                // Filter by signal if requested
                if (signal != null && !signal.isEmpty() &&
                    !stockSignal.get("signal").toString().equalsIgnoreCase(signal)) {
                    continue;
                }

                Map<String, Object> suitability = suitabilityService.calculateSuitability(profile, stock, stockSignal);

                StockPrice latest = stockPriceRepository.findLatestByStockId(stock.getId()).orElse(null);

                Map<String, Object> rec = new LinkedHashMap<>();
                rec.put("stockId", stock.getId());
                rec.put("symbol", stock.getSymbol());
                rec.put("name", stock.getName());
                rec.put("sector", stock.getSector());
                rec.put("riskLevel", stock.getRiskLevel().name());
                rec.put("latestPrice", latest != null ? latest.getClose() : 0);
                rec.put("signal", stockSignal.get("signal"));
                rec.put("signalScore", stockSignal.get("score"));
                rec.put("rsi", stockSignal.get("rsi"));
                rec.put("volatility", stockSignal.get("volatility"));
                rec.put("priceChange", stockSignal.get("priceChange"));
                rec.put("suitabilityScore", suitability.get("suitabilityScore"));
                rec.put("suggestedAmount", suitability.get("suggestedAmount"));
                rec.put("suggestedQuantity", suitability.get("suggestedQuantity"));
                rec.put("riskMatch", suitability.get("riskMatch"));

                recommendations.add(rec);
            } catch (Exception e) {
                // Skip stocks with insufficient data
            }
        }

        // Sort by suitability score descending
        recommendations.sort((a, b) -> {
            long scoreA = (long) a.get("suitabilityScore");
            long scoreB = (long) b.get("suitabilityScore");
            return Long.compare(scoreB, scoreA);
        });

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("investableAmount", profile.getInvestableAmount());
        result.put("riskAppetite", profile.getRiskAppetite().name());
        result.put("investmentGoal", profile.getInvestmentGoal().name());
        result.put("recommendations", recommendations);
        return ResponseEntity.ok(result);
    }
}
