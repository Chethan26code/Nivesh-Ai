package com.niveshai.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class ProfileRequest {

    @NotNull(message = "Monthly income is required")
    @Positive(message = "Monthly income must be positive")
    private Double monthlyIncome;

    @NotNull(message = "Monthly expenses are required")
    @Positive(message = "Monthly expenses must be positive")
    private Double monthlyExpenses;

    @NotNull(message = "Total savings is required")
    @Positive(message = "Total savings must be positive")
    private Double totalSavings;

    @NotNull(message = "Investment goal is required")
    private String investmentGoal;

    @NotNull(message = "Risk appetite is required")
    private String riskAppetite;

    public Double getMonthlyIncome() { return monthlyIncome; }
    public void setMonthlyIncome(Double monthlyIncome) { this.monthlyIncome = monthlyIncome; }
    public Double getMonthlyExpenses() { return monthlyExpenses; }
    public void setMonthlyExpenses(Double monthlyExpenses) { this.monthlyExpenses = monthlyExpenses; }
    public Double getTotalSavings() { return totalSavings; }
    public void setTotalSavings(Double totalSavings) { this.totalSavings = totalSavings; }
    public String getInvestmentGoal() { return investmentGoal; }
    public void setInvestmentGoal(String investmentGoal) { this.investmentGoal = investmentGoal; }
    public String getRiskAppetite() { return riskAppetite; }
    public void setRiskAppetite(String riskAppetite) { this.riskAppetite = riskAppetite; }
}
