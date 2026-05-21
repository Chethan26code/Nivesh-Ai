package com.niveshai.controller;

import com.niveshai.dto.ProfileRequest;
import com.niveshai.model.FinancialProfile;
import com.niveshai.model.User;
import com.niveshai.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @PostMapping
    public ResponseEntity<?> saveProfile(@AuthenticationPrincipal User user,
                                          @Valid @RequestBody ProfileRequest request) {
        FinancialProfile profile = profileService.saveOrUpdate(user.getId(), request);
        return ResponseEntity.ok(profileToMap(profile));
    }

    @GetMapping
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal User user) {
        return profileService.getByUserId(user.getId())
                .map(p -> ResponseEntity.ok(profileToMap(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/simulate")
    public ResponseEntity<?> simulate(@AuthenticationPrincipal User user,
                                       @RequestParam(required = false) Double income,
                                       @RequestParam(required = false) Double expenses) {
        return ResponseEntity.ok(profileService.simulate(user.getId(), income, expenses));
    }

    private Map<String, Object> profileToMap(FinancialProfile p) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", p.getId());
        map.put("monthlyIncome", p.getMonthlyIncome());
        map.put("monthlyExpenses", p.getMonthlyExpenses());
        map.put("totalSavings", p.getTotalSavings());
        map.put("investmentGoal", p.getInvestmentGoal().name());
        map.put("riskAppetite", p.getRiskAppetite().name());
        map.put("investableAmount", p.getInvestableAmount());
        return map;
    }
}
