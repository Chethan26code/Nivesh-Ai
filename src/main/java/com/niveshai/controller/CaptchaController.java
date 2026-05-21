package com.niveshai.controller;

import com.niveshai.service.CaptchaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/captcha")
public class CaptchaController {

    private final CaptchaService captchaService;

    public CaptchaController(CaptchaService captchaService) {
        this.captchaService = captchaService;
    }

    @GetMapping("/generate")
    public ResponseEntity<Map<String, String>> generateCaptcha() {
        return ResponseEntity.ok(captchaService.generateCaptcha());
    }
}
