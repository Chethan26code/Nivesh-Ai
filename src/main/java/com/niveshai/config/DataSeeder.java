package com.niveshai.config;

import com.niveshai.model.Stock;
import com.niveshai.model.StockPrice;
import com.niveshai.repository.StockPriceRepository;
import com.niveshai.repository.StockRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final StockRepository stockRepository;
    private final StockPriceRepository stockPriceRepository;

    public DataSeeder(StockRepository stockRepository, StockPriceRepository stockPriceRepository) {
        this.stockRepository = stockRepository;
        this.stockPriceRepository = stockPriceRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (stockRepository.count() > 0) {
            log.info("Data already seeded. Skipping.");
            return;
        }

        log.info("Seeding stock data...");

        List<StockDef> stockDefs = List.of(
            // Technology
            new StockDef("AAPL", "Apple Inc.", "Technology", Stock.RiskLevel.LOW, 150, 0.018, 0.0003),
            new StockDef("MSFT", "Microsoft Corp.", "Technology", Stock.RiskLevel.LOW, 280, 0.015, 0.0004),
            new StockDef("GOOGL", "Alphabet Inc.", "Technology", Stock.RiskLevel.MEDIUM, 120, 0.020, 0.0002),
            new StockDef("NVDA", "NVIDIA Corp.", "Technology", Stock.RiskLevel.HIGH, 200, 0.030, 0.0008),
            new StockDef("META", "Meta Platforms", "Technology", Stock.RiskLevel.MEDIUM, 180, 0.025, 0.0003),

            // Healthcare
            new StockDef("JNJ", "Johnson & Johnson", "Healthcare", Stock.RiskLevel.LOW, 160, 0.012, 0.0001),
            new StockDef("PFE", "Pfizer Inc.", "Healthcare", Stock.RiskLevel.MEDIUM, 35, 0.020, -0.0002),
            new StockDef("UNH", "UnitedHealth Group", "Healthcare", Stock.RiskLevel.LOW, 480, 0.014, 0.0003),
            new StockDef("ABBV", "AbbVie Inc.", "Healthcare", Stock.RiskLevel.MEDIUM, 140, 0.018, 0.0002),
            new StockDef("MRK", "Merck & Co.", "Healthcare", Stock.RiskLevel.LOW, 105, 0.015, 0.0002),

            // Finance
            new StockDef("JPM", "JPMorgan Chase", "Finance", Stock.RiskLevel.LOW, 140, 0.016, 0.0003),
            new StockDef("BAC", "Bank of America", "Finance", Stock.RiskLevel.MEDIUM, 32, 0.020, 0.0001),
            new StockDef("GS", "Goldman Sachs", "Finance", Stock.RiskLevel.HIGH, 340, 0.022, 0.0002),
            new StockDef("V", "Visa Inc.", "Finance", Stock.RiskLevel.LOW, 230, 0.013, 0.0003),
            new StockDef("MA", "Mastercard Inc.", "Finance", Stock.RiskLevel.LOW, 370, 0.014, 0.0004),

            // Consumer
            new StockDef("AMZN", "Amazon.com Inc.", "Consumer", Stock.RiskLevel.MEDIUM, 130, 0.022, 0.0005),
            new StockDef("WMT", "Walmart Inc.", "Consumer", Stock.RiskLevel.LOW, 155, 0.012, 0.0002),
            new StockDef("COST", "Costco Wholesale", "Consumer", Stock.RiskLevel.LOW, 520, 0.015, 0.0003),
            new StockDef("NKE", "Nike Inc.", "Consumer", Stock.RiskLevel.MEDIUM, 110, 0.020, -0.0001),
            new StockDef("SBUX", "Starbucks Corp.", "Consumer", Stock.RiskLevel.MEDIUM, 95, 0.018, 0.0001),

            // Energy
            new StockDef("XOM", "Exxon Mobil", "Energy", Stock.RiskLevel.MEDIUM, 100, 0.020, 0.0002),
            new StockDef("CVX", "Chevron Corp.", "Energy", Stock.RiskLevel.MEDIUM, 155, 0.019, 0.0001),
            new StockDef("COP", "ConocoPhillips", "Energy", Stock.RiskLevel.HIGH, 110, 0.025, 0.0003),
            new StockDef("SLB", "Schlumberger Ltd.", "Energy", Stock.RiskLevel.HIGH, 50, 0.028, 0.0001),
            new StockDef("EOG", "EOG Resources", "Energy", Stock.RiskLevel.HIGH, 120, 0.026, 0.0002)
        );

        int totalPrices = 0;

        for (StockDef def : stockDefs) {
            Stock stock = new Stock(def.symbol, def.name, def.sector, def.riskLevel);
            stock = stockRepository.save(stock);

            List<StockPrice> prices = generatePriceHistory(stock, def);
            stockPriceRepository.saveAll(prices);
            totalPrices += prices.size();

            log.info("Seeded {} with {} price records", def.symbol, prices.size());
        }

        log.info("Data seeding complete: {} stocks, {} total price records", stockDefs.size(), totalPrices);
    }

    private List<StockPrice> generatePriceHistory(Stock stock, StockDef def) {
        List<StockPrice> prices = new ArrayList<>();
        Random rand = new Random(def.symbol.hashCode()); // Deterministic per stock

        LocalDate startDate = LocalDate.of(2022, 1, 3);
        LocalDate endDate = LocalDate.of(2024, 12, 31);

        double price = def.startPrice;
        LocalDate current = startDate;

        while (!current.isAfter(endDate)) {
            // Skip weekends
            if (current.getDayOfWeek() == DayOfWeek.SATURDAY || current.getDayOfWeek() == DayOfWeek.SUNDAY) {
                current = current.plusDays(1);
                continue;
            }

            // Generate daily return with drift and volatility
            double dailyReturn = def.drift + def.volatility * rand.nextGaussian();

            // Add some momentum and mean reversion
            double momentum = 0.0;
            if (prices.size() > 5) {
                double prev5 = prices.get(prices.size() - 5).getClose();
                momentum = (price - prev5) / prev5 * 0.1;
            }

            // Occasional larger moves (earnings, news)
            if (rand.nextDouble() < 0.02) {
                dailyReturn += (rand.nextBoolean() ? 1 : -1) * def.volatility * 3;
            }

            double newPrice = price * (1 + dailyReturn + momentum * 0.05);
            newPrice = Math.max(newPrice, 5.0); // Floor price at $5

            // Generate OHLC from close
            double close = Math.round(newPrice * 100.0) / 100.0;
            double dayRange = def.volatility * price;
            double high = Math.round((close + rand.nextDouble() * dayRange) * 100.0) / 100.0;
            double low = Math.round((close - rand.nextDouble() * dayRange) * 100.0) / 100.0;
            low = Math.max(low, close * 0.95); // Prevent unrealistic lows
            double open = Math.round((low + rand.nextDouble() * (high - low)) * 100.0) / 100.0;

            // Ensure OHLC consistency
            high = Math.max(high, Math.max(open, close));
            low = Math.min(low, Math.min(open, close));

            // Volume: base volume with some randomness, higher on volatile days
            long baseVolume = (long)(10_000_000 + rand.nextGaussian() * 3_000_000);
            double volMultiplier = 1 + Math.abs(dailyReturn) * 20;
            long volume = Math.max(1_000_000, (long)(baseVolume * volMultiplier));

            StockPrice sp = new StockPrice(stock, current, open, high, low, close, volume);
            prices.add(sp);

            price = close;
            current = current.plusDays(1);
        }

        return prices;
    }

    private record StockDef(String symbol, String name, String sector, Stock.RiskLevel riskLevel,
                            double startPrice, double volatility, double drift) {}
}
