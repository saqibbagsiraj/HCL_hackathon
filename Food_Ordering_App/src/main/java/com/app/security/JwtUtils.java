package com.app.security;

import com.app.config.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtUtils {

    private final JwtService jwtService;

    public String generateToken(String username) {
        return jwtService.generateToken(username);
    }
}
