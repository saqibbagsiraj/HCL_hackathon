package com.app.service;

import com.app.dto.request.RestaurantRequest;
import com.app.dto.response.RestaurantResponse;
import com.app.entity.Restaurant;
import com.app.entity.User;
import com.app.exception.CustomException;
import com.app.repository.RestaurantRepository;
import com.app.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<RestaurantResponse> getActiveRestaurants() {
        return restaurantRepository.findByIsActiveTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RestaurantResponse> getRestaurantsByOwner(Integer ownerId) {
        return restaurantRepository.findByOwnerUserId(ownerId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public RestaurantResponse createRestaurant(RestaurantRequest request) {
        validateRequest(request);
        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Owner not found"));

        Restaurant restaurant = new Restaurant();
        restaurant.setName(request.getName().trim());
        restaurant.setLocation(request.getLocation());
        restaurant.setOwner(owner);
        restaurant.setIsActive(request.getIsActive() == null || request.getIsActive());
        restaurant.setRating(BigDecimal.ZERO);

        Restaurant saved = restaurantRepository.save(restaurant);
        log.info("Restaurant {} created by owner {}", saved.getName(), owner.getEmail());
        return toResponse(saved);
    }

    private void validateRequest(RestaurantRequest request) {
        if (request == null || request.getOwnerId() == null || request.getName() == null || request.getName().isBlank()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Owner and restaurant name are required");
        }
    }

    private RestaurantResponse toResponse(Restaurant restaurant) {
        return new RestaurantResponse(
                restaurant.getRestaurantId(),
                restaurant.getName(),
                restaurant.getLocation(),
                restaurant.getRating(),
                restaurant.getIsActive(),
                restaurant.getOwner().getName(),
                restaurant.getCreatedAt()
        );
    }
}
