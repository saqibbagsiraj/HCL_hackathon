package com.app.repository;

import com.app.entity.Restaurant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantRepository extends JpaRepository<Restaurant, Integer> {

    List<Restaurant> findByIsActiveTrue();

    List<Restaurant> findByOwnerUserId(Integer ownerId);
}
