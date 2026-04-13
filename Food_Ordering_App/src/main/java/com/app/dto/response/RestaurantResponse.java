package com.app.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantResponse {

    private Integer restaurantId;
    private String name;
    private String location;
    private BigDecimal rating;
    private Boolean isActive;
    private String ownerName;
    private LocalDateTime createdAt;
}
