package com.app.dto.response;

public record AuthResponse(
        String message,
        String email,
        String role,
        String authType
) {
}
