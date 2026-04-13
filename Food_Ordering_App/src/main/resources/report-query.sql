SELECT
    o.order_id,
    u.name AS user_name,
    r.name AS restaurant_name,
    m.name AS item_name,
    oi.quantity,
    o.status,
    o.created_at
FROM orders o
JOIN users u ON o.user_id = u.user_id
JOIN restaurants r ON o.restaurant_id = r.restaurant_id
JOIN order_items oi ON o.order_id = oi.order_id
JOIN menu_items m ON oi.item_id = m.item_id
ORDER BY o.order_id, oi.order_item_id;
