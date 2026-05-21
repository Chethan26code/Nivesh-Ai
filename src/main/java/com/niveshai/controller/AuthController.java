package com.niveshai.controller;

import com.niveshai.dto.AuthRequest;
import com.niveshai.dto.AuthResponse;
import com.niveshai.dto.LoginRequest;
import com.niveshai.model.User;
import com.niveshai.repository.FinancialProfileRepository;
import com.niveshai.repository.UserRepository;
import com.niveshai.security.JwtUtil;
import com.niveshai.service.CaptchaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final FinancialProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final CaptchaService captchaService;

    public AuthController(UserRepository userRepository, FinancialProfileRepository profileRepository,
                         PasswordEncoder passwordEncoder, JwtUtil jwtUtil, CaptchaService captchaService) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.captchaService = captchaService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequest request) {
        // Verify CAPTCHA
        if (!captchaService.verifyCaptcha(request.getCaptchaToken(), request.getCaptchaAnswer())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid CAPTCHA"));
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getName()
        );
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getName(), user.getId(), false));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        // Verify CAPTCHA
        if (!captchaService.verifyCaptcha(request.getCaptchaToken(), request.getCaptchaAnswer())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid CAPTCHA"));
        }

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        }

        boolean hasProfile = profileRepository.existsByUserId(user.getId());
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getName(), user.getId(), hasProfile));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }
        boolean hasProfile = profileRepository.existsByUserId(user.getId());
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", user.getId());
        result.put("email", user.getEmail());
        result.put("name", user.getName());
        result.put("hasProfile", hasProfile);
        return ResponseEntity.ok(result);
    }
}
