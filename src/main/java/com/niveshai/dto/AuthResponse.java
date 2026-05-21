package com.niveshai.dto;

public class AuthResponse {
    private String token;
    private String email;
    private String name;
    private Long userId;
    private boolean hasProfile;

    public AuthResponse(String token, String email, String name, Long userId, boolean hasProfile) {
        this.token = token;
        this.email = email;
        this.name = name;
        this.userId = userId;
        this.hasProfile = hasProfile;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public boolean isHasProfile() { return hasProfile; }
    public void setHasProfile(boolean hasProfile) { this.hasProfile = hasProfile; }
}
