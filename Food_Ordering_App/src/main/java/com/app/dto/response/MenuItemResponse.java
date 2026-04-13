package com.app.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemResponse {

    private Integer itemId;
    private Integer restaurantId;
    private String restaurantName;
    private String name;
    private String description;
    private BigDecimal price;
    private Boolean isAvailable;
}
