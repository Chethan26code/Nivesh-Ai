package com.niveshai.controller;

import com.niveshai.model.FinancialProfile;
import com.niveshai.model.User;
import com.niveshai.repository.FinancialProfileRepository;
import com.niveshai.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final PortfolioService portfolioService;
    private final FinancialProfileRepository profileRepository;

    public DashboardController(PortfolioService portfolioService,
                               FinancialProfileRepository profileRepository) {
        this.portfolioService = portfolioService;
        this.profileRepository = profileRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(@AuthenticationPrincipal User user) {
        Map<String, Object> summary = portfolioService.getSummary(user.getId());

        FinancialProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        if (profile != null) {
            summary.put("investableAmount", profile.getInvestableAmount());
            summary.put("riskAppetite", profile.getRiskAppetite().name());
        }

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/allocation")
    public ResponseEntity<?> getAllocation(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(portfolioService.getSectorAllocation(user.getId()));
    }

    @GetMapping("/top-movers")
    public ResponseEntity<?> getTopMovers(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(portfolioService.getTopMovers(user.getId()));
    }

    @GetMapping("/insights")
    public ResponseEntity<?> getInsights(@AuthenticationPrincipal User user) {
        Map<String, Object> summary = portfolioService.getSummary(user.getId());
        Map<String, Double> allocation = portfolioService.getSectorAllocation(user.getId());
        Map<String, List<Map<String, Object>>> movers = portfolioService.getTopMovers(user.getId());

        List<String> insights = new ArrayList<>();
        double totalPnl = (double) summary.get("totalPnl");
        double totalPnlPct = (double) summary.get("totalPnlPercent");
        int holdingsCount = (int) summary.get("holdingsCount");

        if (holdingsCount == 0) {
            insights.add("Welcome! Start building your portfolio by exploring our stock recommendations.");
            insights.add("Complete your financial profile to receive personalized suggestions.");
        } else {
            if (totalPnl > 0) {
                insights.add(String.format("Your portfolio is up %.2f%% overall. Great start!", totalPnlPct));
            } else if (totalPnl < 0) {
                insights.add(String.format("Your portfolio is down %.2f%%. Consider reviewing positions that are underperforming.", Math.abs(totalPnlPct)));
            }

            // Diversification check
            if (allocation.size() < 3 && holdingsCount > 2) {
                insights.add("Consider diversifying across more sectors to reduce risk.");
            } else if (allocation.size() >= 4) {
                insights.add("Good sector diversification! You're spread across " + allocation.size() + " sectors.");
            }

            // Check concentration
            allocation.values().stream().max(Double::compareTo).ifPresent(maxPct -> {
                if (maxPct > 50) {
                    insights.add("Over 50% of your portfolio is concentrated in one sector. Consider rebalancing.");
                }
            });

            // Top performers
            if (!movers.get("gainers").isEmpty()) {
                Map<String, Object> topGainer = movers.get("gainers").get(0);
                insights.add(String.format("%s is your top performer at +%.2f%%.",
                        topGainer.get("symbol"), (double) topGainer.get("pnlPercent")));
            }

            if (!movers.get("losers").isEmpty()) {
                Map<String, Object> topLoser = movers.get("losers").get(0);
                insights.add(String.format("Watch %s — it's down %.2f%%. Review if it aligns with your strategy.",
                        topLoser.get("symbol"), Math.abs((double) topLoser.get("pnlPercent"))));
            }
        }

        return ResponseEntity.ok(Map.of("insights", insights));
    }
}
