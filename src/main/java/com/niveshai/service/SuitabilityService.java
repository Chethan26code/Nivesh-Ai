package com.niveshai.service;

import com.niveshai.model.FinancialProfile;
import com.niveshai.model.Stock;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SuitabilityService {

    /**
     * Calculate suitability score (0-100) based on user profile and stock characteristics.
     */
    public Map<String, Object> calculateSuitability(FinancialProfile profile, Stock stock, Map<String, Object> signal) {
        double score = 0;

        // 1. Risk match (40 points max)
        score += riskMatchScore(profile.getRiskAppetite(), stock.getRiskLevel()) * 40;

        // 2. Goal alignment (30 points max)
        score += goalAlignmentScore(profile.getInvestmentGoal(), stock.getRiskLevel(),
                signal.get("volatilityRisk").toString()) * 30;

        // 3. Affordability (20 points max)
        double latestPrice = (double) signal.get("latestPrice");
        score += affordabilityScore(profile.getInvestableAmount(), latestPrice) * 20;

        // 4. Signal strength bonus (10 points max)
        double signalScore = (double) signal.get("score");
        score += Math.max(0, signalScore) * 10;

        // Calculate suggested investment
        double suggestedAmount = calculateSuggestedAmount(profile, stock, latestPrice);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("suitabilityScore", Math.round(Math.min(100, Math.max(0, score))));
        result.put("suggestedAmount", Math.round(suggestedAmount * 100.0) / 100.0);
        result.put("suggestedQuantity", Math.max(1, (int)(suggestedAmount / latestPrice)));
        result.put("riskMatch", riskMatchLabel(profile.getRiskAppetite(), stock.getRiskLevel()));
        return result;
    }

    private double riskMatchScore(FinancialProfile.RiskAppetite appetite, Stock.RiskLevel stockRisk) {
        return switch (appetite) {
            case CONSERVATIVE -> switch (stockRisk) {
                case LOW -> 1.0;
                case MEDIUM -> 0.5;
                case HIGH -> 0.1;
            };
            case MODERATE -> switch (stockRisk) {
                case LOW -> 0.7;
                case MEDIUM -> 1.0;
                case HIGH -> 0.4;
            };
            case AGGRESSIVE -> switch (stockRisk) {
                case LOW -> 0.4;
                case MEDIUM -> 0.7;
                case HIGH -> 1.0;
            };
        };
    }

    private String riskMatchLabel(FinancialProfile.RiskAppetite appetite, Stock.RiskLevel stockRisk) {
        double score = riskMatchScore(appetite, stockRisk);
        if (score >= 0.8) return "Excellent Match";
        if (score >= 0.5) return "Good Match";
        return "Risky for Profile";
    }

    private double goalAlignmentScore(FinancialProfile.InvestmentGoal goal,
                                       Stock.RiskLevel stockRisk, String volatilityRisk) {
        boolean isVolatile = "HIGH".equals(volatilityRisk);
        return switch (goal) {
            case SHORT_TERM -> isVolatile ? 0.2 : (stockRisk == Stock.RiskLevel.LOW ? 1.0 : 0.5);
            case MEDIUM_TERM -> stockRisk == Stock.RiskLevel.HIGH ? 0.4 : 0.8;
            case LONG_TERM -> 0.9; // long-term can absorb volatility
        };
    }

    private double affordabilityScore(double investableAmount, double stockPrice) {
        if (investableAmount <= 0) return 0;
        double ratio = investableAmount / stockPrice;
        if (ratio >= 10) return 1.0;
        if (ratio >= 5) return 0.8;
        if (ratio >= 2) return 0.6;
        if (ratio >= 1) return 0.3;
        return 0.1;
    }

    private double calculateSuggestedAmount(FinancialProfile profile, Stock stock, double price) {
        double investable = profile.getInvestableAmount();
        // Diversification: suggest max 15-25% of investable in single stock
        double maxPct = switch (profile.getRiskAppetite()) {
            case CONSERVATIVE -> 0.10;
            case MODERATE -> 0.15;
            case AGGRESSIVE -> 0.25;
        };
        double suggested = investable * maxPct;
        // Round to nearest quantity
        int qty = (int)(suggested / price);
        return Math.max(price, qty * price);
    }
}
