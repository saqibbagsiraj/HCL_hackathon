package com.app.dto.request;

import java.util.List;

public record OrderRequest(
        Integer restaurantId,
        List<OrderItemRequest> items
) {
    public record OrderItemRequest(
            Integer itemId,
            Integer quantity
    ) {
    }
}
