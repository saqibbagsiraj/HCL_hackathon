package com.app.repository;

import com.app.entity.MenuItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuRepository extends JpaRepository<MenuItem, Integer> {

    List<MenuItem> findByRestaurantRestaurantId(Integer restaurantId);

    List<MenuItem> findByRestaurantRestaurantIdAndIsAvailableTrue(Integer restaurantId);
}
