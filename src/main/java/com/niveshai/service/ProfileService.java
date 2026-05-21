package com.niveshai.service;

import com.niveshai.dto.ProfileRequest;
import com.niveshai.model.FinancialProfile;
import com.niveshai.model.User;
import com.niveshai.repository.FinancialProfileRepository;
import com.niveshai.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ProfileService {

    private final FinancialProfileRepository profileRepository;
    private final UserRepository userRepository;

    public ProfileService(FinancialProfileRepository profileRepository, UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    public FinancialProfile saveOrUpdate(Long userId, ProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FinancialProfile profile = profileRepository.findByUserId(userId)
                .orElse(new FinancialProfile());

        profile.setUser(user);
        profile.setMonthlyIncome(request.getMonthlyIncome());
        profile.setMonthlyExpenses(request.getMonthlyExpenses());
        profile.setTotalSavings(request.getTotalSavings());
        profile.setInvestmentGoal(FinancialProfile.InvestmentGoal.valueOf(request.getInvestmentGoal()));
        profile.setRiskAppetite(FinancialProfile.RiskAppetite.valueOf(request.getRiskAppetite()));
        profile.setInvestableAmount(calculateInvestableAmount(request));

        return profileRepository.save(profile);
    }

    public Optional<FinancialProfile> getByUserId(Long userId) {
        return profileRepository.findByUserId(userId);
    }

    public double calculateInvestableAmount(ProfileRequest request) {
        double surplus = request.getMonthlyIncome() - request.getMonthlyExpenses();
        if (surplus <= 0) return 0;

        double savingsRate = switch (request.getRiskAppetite()) {
            case "CONSERVATIVE" -> 0.15;
            case "MODERATE" -> 0.25;
            case "AGGRESSIVE" -> 0.40;
            default -> 0.20;
        };

        double monthlyInvestable = surplus * savingsRate;

        // Factor in total savings — allocate a portion as lump sum
        double savingsAllocation = switch (request.getInvestmentGoal()) {
            case "SHORT_TERM" -> request.getTotalSavings() * 0.05;
            case "MEDIUM_TERM" -> request.getTotalSavings() * 0.10;
            case "LONG_TERM" -> request.getTotalSavings() * 0.15;
            default -> request.getTotalSavings() * 0.10;
        };

        return Math.round((monthlyInvestable * 12 + savingsAllocation) * 100.0) / 100.0;
    }

    public Map<String, Object> simulate(Long userId, Double newIncome, Double newExpenses) {
        FinancialProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        ProfileRequest simulated = new ProfileRequest();
        simulated.setMonthlyIncome(newIncome != null ? newIncome : profile.getMonthlyIncome());
        simulated.setMonthlyExpenses(newExpenses != null ? newExpenses : profile.getMonthlyExpenses());
        simulated.setTotalSavings(profile.getTotalSavings());
        simulated.setInvestmentGoal(profile.getInvestmentGoal().name());
        simulated.setRiskAppetite(profile.getRiskAppetite().name());

        double newInvestable = calculateInvestableAmount(simulated);
        double currentInvestable = profile.getInvestableAmount();
        double change = newInvestable - currentInvestable;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("currentInvestable", currentInvestable);
        result.put("simulatedInvestable", newInvestable);
        result.put("change", Math.round(change * 100.0) / 100.0);
        result.put("changePercent", currentInvestable > 0 ?
                Math.round(change / currentInvestable * 10000.0) / 100.0 : 0);
        return result;
    }
}
