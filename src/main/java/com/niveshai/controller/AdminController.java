package com.niveshai.controller;

import com.niveshai.model.Portfolio;
import com.niveshai.model.User;
import com.niveshai.repository.PortfolioRepository;
import com.niveshai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @GetMapping("/data")
    public Map<String, Object> getAdminData() {
        Map<String, Object> data = new HashMap<>();
        
        List<User> users = userRepository.findAll();
        // Remove passwords and profiles to avoid lazy loading issues
        users.forEach(u -> {
            u.setPasswordHash(null);
            u.setFinancialProfile(null);
        });
        
        List<Portfolio> transactions = portfolioRepository.findAll();
        List<Map<String, Object>> txData = transactions.stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", t.getId());
            map.put("userId", t.getUser().getId());
            map.put("stockSymbol", t.getStock().getSymbol());
            map.put("quantity", t.getQuantity());
            map.put("buyPrice", t.getBuyPrice());
            map.put("buyDate", t.getBuyDate());
            return map;
        }).toList();
        
        data.put("users", users);
        data.put("transactions", txData);
        
        return data;
    }
}
