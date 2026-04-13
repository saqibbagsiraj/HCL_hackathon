package com.app.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Integer orderId,
        String customerName,
        String restaurantName,
        BigDecimal totalAmount,
        String status,
        LocalDateTime createdAt,
        List<OrderItemSummary> items
) {
    public record OrderItemSummary(
            Integer itemId,
            String itemName,
            Integer quantity,
            BigDecimal price
    ) {
    }
}
