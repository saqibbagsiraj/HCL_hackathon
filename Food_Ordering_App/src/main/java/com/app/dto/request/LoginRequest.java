package com.app.dto.request;

public record LoginRequest(
        String email,
        String password
) {
}
