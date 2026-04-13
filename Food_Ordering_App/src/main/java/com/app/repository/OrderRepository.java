package com.app.repository;

import com.app.entity.Order;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Integer> {

    List<Order> findByUserUserIdOrderByCreatedAtDesc(Integer userId);

    List<Order> findByRestaurantRestaurantIdOrderByCreatedAtDesc(Integer restaurantId);
}
