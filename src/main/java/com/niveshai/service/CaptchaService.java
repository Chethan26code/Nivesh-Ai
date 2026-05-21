package com.niveshai.service;

import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CaptchaService {

    private static final String HMAC_SECRET = "NiveshAICaptchaSecret2024!";
    private final Map<String, CaptchaEntry> captchaStore = new ConcurrentHashMap<>();

    public Map<String, String> generateCaptcha() {
        Random rand = new Random();
        int a = rand.nextInt(20) + 1;
        int b = rand.nextInt(20) + 1;
        String[] ops = {"+", "-", "x"};
        String op = ops[rand.nextInt(ops.length)];

        int answer;
        switch (op) {
            case "+": answer = a + b; break;
            case "-": answer = a - b; break;
            case "x": answer = a * b; break;
            default: answer = a + b;
        }

        String question = a + " " + op + " " + b + " = ?";
        String token = UUID.randomUUID().toString();
        String hashedAnswer = hmac(String.valueOf(answer));

        captchaStore.put(token, new CaptchaEntry(hashedAnswer, System.currentTimeMillis()));

        // Clean up expired entries (older than 5 minutes)
        long now = System.currentTimeMillis();
        captchaStore.entrySet().removeIf(e -> now - e.getValue().timestamp > 300_000);

        Map<String, String> result = new HashMap<>();
        result.put("question", question);
        result.put("token", token);
        return result;
    }

    public boolean verifyCaptcha(String token, String answer) {
        CaptchaEntry entry = captchaStore.remove(token);
        if (entry == null) return false;

        // Check expiry (5 minutes)
        if (System.currentTimeMillis() - entry.timestamp > 300_000) return false;

        String hashedAnswer = hmac(answer.trim());
        return hashedAnswer.equals(entry.hashedAnswer);
    }

    private String hmac(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(HMAC_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(keySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(rawHmac);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("HMAC error", e);
        }
    }

    private static class CaptchaEntry {
        String hashedAnswer;
        long timestamp;

        CaptchaEntry(String hashedAnswer, long timestamp) {
            this.hashedAnswer = hashedAnswer;
            this.timestamp = timestamp;
        }
    }
}
