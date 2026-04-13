package com.app.dto.request;

import java.math.BigDecimal;

public record MenuRequest(
        Integer restaurantId,
        String name,
        String description,
        BigDecimal price,
        Boolean isAvailable
) {
}
