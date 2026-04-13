package com.app.config;

import org.springframework.stereotype.Service;

@Service
public class JwtService {

    public String generateToken(String username) {
        return username;
    }

    public String extractUsername(String token) {
        return token;
    }

    public boolean isTokenValid(String token, String username) {
        return token != null && token.equals(username);
    }
}
