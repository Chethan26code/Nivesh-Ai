package com.niveshai.service;

import com.niveshai.model.StockPrice;
import com.niveshai.repository.StockPriceRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SignalService {

    private final StockPriceRepository stockPriceRepository;

    public SignalService(StockPriceRepository stockPriceRepository) {
        this.stockPriceRepository = stockPriceRepository;
    }

    /**
     * Generate a trading signal for a stock.
     * Returns a map with: signal (BUY/SELL/HOLD), score (-1 to 1), indicators
     */
    public Map<String, Object> generateSignal(Long stockId) {
        List<StockPrice> prices = stockPriceRepository.findByStockIdOrderByDateAsc(stockId);

        if (prices.size() < 50) {
            return Map.of("signal", "HOLD", "score", 0.0, "reason", "Insufficient data");
        }

        double[] closes = prices.stream().mapToDouble(StockPrice::getClose).toArray();

        // SMA Crossover (20 vs 50)
        double smaSignal = calculateSMASignal(closes);

        // RSI (14-day)
        double rsiSignal = calculateRSISignal(closes);
        double rsiValue = calculateRSI(closes, 14);

        // MACD (12, 26, 9)
        double macdSignal = calculateMACDSignal(closes);

        // Combined score
        double score = (smaSignal * 0.4) + (rsiSignal * 0.3) + (macdSignal * 0.3);

        String signal;
        if (score > 0.3) signal = "BUY";
        else if (score < -0.3) signal = "SELL";
        else signal = "HOLD";

        // Calculate volatility for risk classification
        double volatility = calculateVolatility(closes, 90);
        String riskFromVolatility;
        if (volatility < 0.015) riskFromVolatility = "LOW";
        else if (volatility < 0.025) riskFromVolatility = "MEDIUM";
        else riskFromVolatility = "HIGH";

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("signal", signal);
        result.put("score", Math.round(score * 100.0) / 100.0);
        result.put("rsi", Math.round(rsiValue * 100.0) / 100.0);
        result.put("smaSignal", smaSignal > 0 ? "BULLISH" : smaSignal < 0 ? "BEARISH" : "NEUTRAL");
        result.put("macdSignal", macdSignal > 0 ? "BULLISH" : macdSignal < 0 ? "BEARISH" : "NEUTRAL");
        result.put("volatility", Math.round(volatility * 10000.0) / 100.0); // as percentage
        result.put("volatilityRisk", riskFromVolatility);
        result.put("latestPrice", closes[closes.length - 1]);
        result.put("priceChange", Math.round((closes[closes.length - 1] / closes[closes.length - 2] - 1) * 10000.0) / 100.0);
        return result;
    }

    private double calculateSMASignal(double[] closes) {
        int len = closes.length;
        double sma20 = average(closes, len - 20, len);
        double sma50 = average(closes, len - 50, len);
        double prevSma20 = average(closes, len - 21, len - 1);
        double prevSma50 = average(closes, len - 51, len - 1);

        // Crossover detection
        if (prevSma20 <= prevSma50 && sma20 > sma50) return 1.0;  // Golden cross
        if (prevSma20 >= prevSma50 && sma20 < sma50) return -1.0; // Death cross
        if (sma20 > sma50) return 0.5;
        if (sma20 < sma50) return -0.5;
        return 0.0;
    }

    private double calculateRSI(double[] closes, int period) {
        double gainSum = 0, lossSum = 0;
        for (int i = closes.length - period; i < closes.length; i++) {
            double change = closes[i] - closes[i - 1];
            if (change > 0) gainSum += change;
            else lossSum += Math.abs(change);
        }
        double avgGain = gainSum / period;
        double avgLoss = lossSum / period;
        if (avgLoss == 0) return 100;
        double rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    private double calculateRSISignal(double[] closes) {
        double rsi = calculateRSI(closes, 14);
        if (rsi < 30) return 1.0;   // Oversold -> BUY
        if (rsi > 70) return -1.0;  // Overbought -> SELL
        if (rsi < 40) return 0.5;
        if (rsi > 60) return -0.5;
        return 0.0;
    }

    private double calculateMACDSignal(double[] closes) {
        double[] ema12 = calculateEMA(closes, 12);
        double[] ema26 = calculateEMA(closes, 26);

        int len = closes.length;
        double[] macdLine = new double[len];
        for (int i = 0; i < len; i++) {
            macdLine[i] = ema12[i] - ema26[i];
        }

        double[] signalLine = calculateEMA(macdLine, 9);

        double currentMACD = macdLine[len - 1];
        double currentSignal = signalLine[len - 1];
        double prevMACD = macdLine[len - 2];
        double prevSignal = signalLine[len - 2];

        // Crossover
        if (prevMACD <= prevSignal && currentMACD > currentSignal) return 1.0;
        if (prevMACD >= prevSignal && currentMACD < currentSignal) return -1.0;
        if (currentMACD > currentSignal) return 0.3;
        if (currentMACD < currentSignal) return -0.3;
        return 0.0;
    }

    private double[] calculateEMA(double[] data, int period) {
        double[] ema = new double[data.length];
        double multiplier = 2.0 / (period + 1);
        ema[0] = data[0];
        for (int i = 1; i < data.length; i++) {
            ema[i] = (data[i] - ema[i - 1]) * multiplier + ema[i - 1];
        }
        return ema;
    }

    private double calculateVolatility(double[] closes, int period) {
        int start = Math.max(0, closes.length - period);
        double[] returns = new double[closes.length - start - 1];
        for (int i = 0; i < returns.length; i++) {
            returns[i] = Math.log(closes[start + i + 1] / closes[start + i]);
        }
        double mean = Arrays.stream(returns).average().orElse(0);
        double variance = Arrays.stream(returns).map(r -> (r - mean) * (r - mean)).average().orElse(0);
        return Math.sqrt(variance);
    }

    private double average(double[] arr, int from, int to) {
        double sum = 0;
        int count = 0;
        for (int i = Math.max(0, from); i < Math.min(arr.length, to); i++) {
            sum += arr[i];
            count++;
        }
        return count == 0 ? 0 : sum / count;
    }
}
