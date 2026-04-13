INSERT INTO roles (name)
VALUES
('USER'),
('ADMIN'),
('RESTAURANT')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (name, email, password, role_id, phone, address)
SELECT 'Diya', 'diya@gmail.com', '$2a$10$hashedpasswordexample', role_id, '9876543210', 'Bangalore'
FROM roles
WHERE name = 'USER'
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password, role_id, phone, address)
SELECT 'Owner1', 'owner@gmail.com', '$2a$10$hashedpasswordexample', role_id, '9123456780', 'Bangalore'
FROM roles
WHERE name = 'RESTAURANT'
ON CONFLICT (email) DO NOTHING;

INSERT INTO restaurants (name, location, owner_id)
SELECT 'Pizza Hut', 'Bangalore', u.user_id
FROM users u
WHERE u.email = 'owner@gmail.com'
  AND NOT EXISTS (
      SELECT 1
      FROM restaurants r
      WHERE r.name = 'Pizza Hut'
        AND r.owner_id = u.user_id
  );

INSERT INTO restaurants (name, location, owner_id)
SELECT 'KFC', 'Bangalore', u.user_id
FROM users u
WHERE u.email = 'owner@gmail.com'
  AND NOT EXISTS (
      SELECT 1
      FROM restaurants r
      WHERE r.name = 'KFC'
        AND r.owner_id = u.user_id
  );

INSERT INTO menu_items (restaurant_id, name, description, price)
SELECT r.restaurant_id, 'Veg Pizza', 'Cheesy veg pizza', 250.00
FROM restaurants r
WHERE r.name = 'Pizza Hut'
  AND NOT EXISTS (
      SELECT 1
      FROM menu_items m
      WHERE m.restaurant_id = r.restaurant_id
        AND m.name = 'Veg Pizza'
  );

INSERT INTO menu_items (restaurant_id, name, description, price)
SELECT r.restaurant_id, 'Cheese Pizza', 'Extra cheese', 300.00
FROM restaurants r
WHERE r.name = 'Pizza Hut'
  AND NOT EXISTS (
      SELECT 1
      FROM menu_items m
      WHERE m.restaurant_id = r.restaurant_id
        AND m.name = 'Cheese Pizza'
  );

INSERT INTO menu_items (restaurant_id, name, description, price)
SELECT r.restaurant_id, 'Chicken Bucket', 'Crispy chicken', 500.00
FROM restaurants r
WHERE r.name = 'KFC'
  AND NOT EXISTS (
      SELECT 1
      FROM menu_items m
      WHERE m.restaurant_id = r.restaurant_id
        AND m.name = 'Chicken Bucket'
  );

INSERT INTO orders (user_id, restaurant_id, total_amount, status)
SELECT u.user_id, r.restaurant_id, 550.00, 'PLACED'
FROM users u
JOIN restaurants r ON r.name = 'Pizza Hut'
WHERE u.email = 'diya@gmail.com'
  AND NOT EXISTS (
      SELECT 1
      FROM orders o
      WHERE o.user_id = u.user_id
        AND o.restaurant_id = r.restaurant_id
        AND o.total_amount = 550.00
        AND o.status = 'PLACED'
  );

INSERT INTO order_items (order_id, item_id, quantity)
SELECT o.order_id, m.item_id, 1
FROM orders o
JOIN menu_items m ON m.name = 'Veg Pizza'
WHERE o.status = 'PLACED'
  AND NOT EXISTS (
      SELECT 1
      FROM order_items oi
      WHERE oi.order_id = o.order_id
        AND oi.item_id = m.item_id
  );

INSERT INTO order_items (order_id, item_id, quantity)
SELECT o.order_id, m.item_id, 1
FROM orders o
JOIN menu_items m ON m.name = 'Cheese Pizza'
WHERE o.status = 'PLACED'
  AND NOT EXISTS (
      SELECT 1
      FROM order_items oi
      WHERE oi.order_id = o.order_id
        AND oi.item_id = m.item_id
  );
