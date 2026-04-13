package com.app.service;

import com.app.dto.request.MenuRequest;
import com.app.dto.response.MenuItemResponse;
import com.app.entity.MenuItem;
import com.app.entity.Restaurant;
import com.app.exception.CustomException;
import com.app.repository.MenuRepository;
import com.app.repository.RestaurantRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class MenuService {

    private final MenuRepository menuRepository;
    private final RestaurantRepository restaurantRepository;

    @Transactional(readOnly = true)
    public List<MenuItemResponse> getMenuByRestaurant(Integer restaurantId) {
        return menuRepository.findByRestaurantRestaurantIdAndIsAvailableTrue(restaurantId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public MenuItemResponse addMenuItem(MenuRequest request) {
        validateRequest(request);
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Restaurant not found"));

        MenuItem menuItem = new MenuItem();
        menuItem.setRestaurant(restaurant);
        menuItem.setName(request.getName().trim());
        menuItem.setDescription(request.getDescription());
        menuItem.setPrice(request.getPrice());
        menuItem.setIsAvailable(request.getIsAvailable() == null || request.getIsAvailable());

        MenuItem saved = menuRepository.save(menuItem);
        log.info("Menu item {} added for restaurant {}", saved.getName(), restaurant.getName());
        return toResponse(saved);
    }

    @Transactional
    public MenuItemResponse updateMenuItem(Integer itemId, MenuRequest request) {
        validateRequest(request);
        MenuItem menuItem = menuRepository.findById(itemId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Menu item not found"));

        if (!menuItem.getRestaurant().getRestaurantId().equals(request.getRestaurantId())) {
            Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                    .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Restaurant not found"));
            menuItem.setRestaurant(restaurant);
        }

        menuItem.setName(request.getName().trim());
        menuItem.setDescription(request.getDescription());
        menuItem.setPrice(request.getPrice());
        menuItem.setIsAvailable(request.getIsAvailable() == null || request.getIsAvailable());
        return toResponse(menuRepository.save(menuItem));
    }

    @Transactional
    public void deleteMenuItem(Integer itemId) {
        if (!menuRepository.existsById(itemId)) {
            throw new CustomException(HttpStatus.NOT_FOUND, "Menu item not found");
        }
        menuRepository.deleteById(itemId);
        log.info("Menu item {} deleted", itemId);
    }

    private void validateRequest(MenuRequest request) {
        if (request == null || request.getRestaurantId() == null || request.getName() == null
                || request.getName().isBlank() || request.getPrice() == null) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Restaurant, item name and price are required");
        }
    }

    private MenuItemResponse toResponse(MenuItem item) {
        return new MenuItemResponse(
                item.getItemId(),
                item.getRestaurant().getRestaurantId(),
                item.getRestaurant().getName(),
                item.getName(),
                item.getDescription(),
                item.getPrice(),
                item.getIsAvailable()
        );
    }
}
