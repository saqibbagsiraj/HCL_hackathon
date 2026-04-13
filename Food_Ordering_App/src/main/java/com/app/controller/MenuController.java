package com.app.controller;

import com.app.dto.request.MenuRequest;
import com.app.dto.response.MenuItemResponse;
import com.app.service.MenuService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<MenuItemResponse>> getRestaurantMenu(@PathVariable Integer restaurantId) {
        return ResponseEntity.ok(menuService.getMenuByRestaurant(restaurantId));
    }

    @PostMapping
    public ResponseEntity<MenuItemResponse> addMenuItem(@RequestBody MenuRequest request) {
        return ResponseEntity.ok(menuService.addMenuItem(request));
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<MenuItemResponse> updateMenuItem(@PathVariable Integer itemId, @RequestBody MenuRequest request) {
        return ResponseEntity.ok(menuService.updateMenuItem(itemId, request));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Integer itemId) {
        menuService.deleteMenuItem(itemId);
        return ResponseEntity.noContent().build();
    }
}
