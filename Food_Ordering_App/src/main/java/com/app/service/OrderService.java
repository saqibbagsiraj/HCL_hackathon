package com.app.service;

import com.app.dto.request.OrderRequest;
import com.app.dto.response.OrderResponse;
import com.app.entity.MenuItem;
import com.app.entity.Order;
import com.app.entity.OrderItem;
import com.app.entity.Restaurant;
import com.app.entity.User;
import com.app.exception.CustomException;
import com.app.repository.MenuRepository;
import com.app.repository.OrderRepository;
import com.app.repository.RestaurantRepository;
import com.app.repository.UserRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuRepository menuRepository;
    private final EmailService emailService;

    public OrderService(
            OrderRepository orderRepository,
            UserRepository userRepository,
            RestaurantRepository restaurantRepository,
            MenuRepository menuRepository,
            EmailService emailService
    ) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
        this.menuRepository = menuRepository;
        this.emailService = emailService;
    }

    @Transactional
    public OrderResponse placeOrder(String email, OrderRequest request) {
        if (request == null || request.restaurantId() == null || request.items() == null || request.items().isEmpty()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Restaurant and items are required");
        }

        User user = getUserByEmail(email);
        Restaurant restaurant = restaurantRepository.findById(request.restaurantId())
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Restaurant not found"));

        Order order = new Order();
        order.setUser(user);
        order.setRestaurant(restaurant);
        order.setStatus("PLACED");

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderRequest.OrderItemRequest itemRequest : request.items()) {
            if (itemRequest.itemId() == null || itemRequest.quantity() == null || itemRequest.quantity() <= 0) {
                throw new CustomException(HttpStatus.BAD_REQUEST, "Each item must have a valid itemId and quantity");
            }

            MenuItem menuItem = menuRepository.findById(itemRequest.itemId())
                    .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Menu item not found: " + itemRequest.itemId()));

            if (!restaurant.getRestaurantId().equals(menuItem.getRestaurant().getRestaurantId())) {
                throw new CustomException(HttpStatus.BAD_REQUEST, "All items must belong to the selected restaurant");
            }

            if (!Boolean.TRUE.equals(menuItem.getIsAvailable())) {
                throw new CustomException(HttpStatus.BAD_REQUEST, "Menu item is unavailable: " + menuItem.getName());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setItem(menuItem);
            orderItem.setQuantity(itemRequest.quantity());
            orderItems.add(orderItem);

            total = total.add(menuItem.getPrice().multiply(BigDecimal.valueOf(itemRequest.quantity())));
        }

        order.setTotalAmount(total);
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);
        emailService.sendOrderConfirmationEmail(user.getEmail(), savedOrder.getOrderId());
        log.info("Order {} created for user {}", savedOrder.getOrderId(), user.getEmail());
        return toResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersForUser(String email) {
        User user = getUserByEmail(email);
        return orderRepository.findByUserUserIdOrderByCreatedAtDesc(user.getUserId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public OrderResponse cancelOrder(String email, Integer orderId) {
        User user = getUserByEmail(email);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getUser().getUserId().equals(user.getUserId())) {
            throw new CustomException(HttpStatus.FORBIDDEN, "You can only cancel your own orders");
        }

        if ("CANCELLED".equals(order.getStatus())) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Order is already cancelled");
        }

        order.setStatus("CANCELLED");
        Order updatedOrder = orderRepository.save(order);
        emailService.sendOrderCancellationEmail(user.getEmail(), updatedOrder.getOrderId());
        log.info("Order {} cancelled by user {}", updatedOrder.getOrderId(), user.getEmail());
        return toResponse(updatedOrder);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private OrderResponse toResponse(Order order) {
        return new OrderResponse(
                order.getOrderId(),
                order.getUser().getName(),
                order.getRestaurant().getName(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getCreatedAt(),
                order.getOrderItems().stream()
                        .map(item -> new OrderResponse.OrderItemSummary(
                                item.getItem().getItemId(),
                                item.getItem().getName(),
                                item.getQuantity(),
                                item.getItem().getPrice()
                        ))
                        .toList()
        );
    }
}
