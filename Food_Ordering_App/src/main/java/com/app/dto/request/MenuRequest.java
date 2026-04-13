package com.app.dto.request;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuRequest {

    private Integer restaurantId;
    private String name;
    private String description;
    private BigDecimal price;
    private Boolean isAvailable;
}
