package com.niveshai.controller;

import com.niveshai.dto.TradeRequest;
import com.niveshai.model.User;
import com.niveshai.service.PortfolioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping
    public ResponseEntity<?> getHoldings(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(portfolioService.getHoldings(user.getId()));
    }

    @PostMapping("/buy")
    public ResponseEntity<?> buy(@AuthenticationPrincipal User user,
                                  @Valid @RequestBody TradeRequest request) {
        try {
            LocalDate date = LocalDate.parse(request.getDate());
            Map<String, Object> result = portfolioService.buyStock(
                    user.getId(), request.getStockId(), request.getQuantity(), date);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/sell")
    public ResponseEntity<?> sell(@AuthenticationPrincipal User user,
                                   @Valid @RequestBody TradeRequest request) {
        try {
            LocalDate date = LocalDate.parse(request.getDate());
            Map<String, Object> result = portfolioService.sellStock(
                    user.getId(), request.getPortfolioId(), request.getQuantity(), date);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(portfolioService.getTradeHistory(user.getId()));
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(portfolioService.getSummary(user.getId()));
    }
}
