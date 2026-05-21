package com.niveshai.model;

import jakarta.persistence.*;

@Entity
@Table(name = "financial_profiles")
public class FinancialProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private Double monthlyIncome;

    @Column(nullable = false)
    private Double monthlyExpenses;

    @Column(nullable = false)
    private Double totalSavings;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private InvestmentGoal investmentGoal;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RiskAppetite riskAppetite;

    @Column(nullable = false)
    private Double investableAmount;

    public FinancialProfile() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Double getMonthlyIncome() { return monthlyIncome; }
    public void setMonthlyIncome(Double monthlyIncome) { this.monthlyIncome = monthlyIncome; }
    public Double getMonthlyExpenses() { return monthlyExpenses; }
    public void setMonthlyExpenses(Double monthlyExpenses) { this.monthlyExpenses = monthlyExpenses; }
    public Double getTotalSavings() { return totalSavings; }
    public void setTotalSavings(Double totalSavings) { this.totalSavings = totalSavings; }
    public InvestmentGoal getInvestmentGoal() { return investmentGoal; }
    public void setInvestmentGoal(InvestmentGoal investmentGoal) { this.investmentGoal = investmentGoal; }
    public RiskAppetite getRiskAppetite() { return riskAppetite; }
    public void setRiskAppetite(RiskAppetite riskAppetite) { this.riskAppetite = riskAppetite; }
    public Double getInvestableAmount() { return investableAmount; }
    public void setInvestableAmount(Double investableAmount) { this.investableAmount = investableAmount; }

    public enum InvestmentGoal {
        SHORT_TERM, MEDIUM_TERM, LONG_TERM
    }

    public enum RiskAppetite {
        CONSERVATIVE, MODERATE, AGGRESSIVE
    }
}
