package com.app.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Integer orderId;
    private String customerName;
    private String restaurantName;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private List<OrderItemSummary> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemSummary {

        private Integer itemId;
        private String itemName;
        private Integer quantity;
        private BigDecimal price;
    }
}
