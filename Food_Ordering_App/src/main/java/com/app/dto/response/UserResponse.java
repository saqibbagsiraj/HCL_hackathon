package com.app.dto.response;

import java.time.LocalDateTime;

public record UserResponse(
        Integer userId,
        String name,
        String email,
        String phone,
        String address,
        String role,
        LocalDateTime createdAt
) {
}
