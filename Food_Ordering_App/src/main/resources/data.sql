INSERT INTO roles (name) VALUES
('USER'),
('ADMIN'),
('RESTAURANT');

INSERT INTO users (name, email, password, role_id, phone, address)
VALUES
('Diya', 'diya@gmail.com', '$2a$10$hashedpasswordexample', 1, '9876543210', 'Bangalore'),
('Owner1', 'owner@gmail.com', '$2a$10$hashedpasswordexample', 3, '9123456780', 'Bangalore');

INSERT INTO restaurants (name, location, owner_id)
VALUES
('Pizza Hut', 'Bangalore', 2),
('KFC', 'Bangalore', 2);

INSERT INTO menu_items (restaurant_id, name, description, price)
VALUES
(1, 'Veg Pizza', 'Cheesy veg pizza', 250.00),
(1, 'Cheese Pizza', 'Extra cheese', 300.00),
(2, 'Chicken Bucket', 'Crispy chicken', 500.00);

INSERT INTO orders (user_id, restaurant_id, total_amount, status)
VALUES
(1, 1, 550.00, 'PLACED');

INSERT INTO order_items (order_id, item_id, quantity)
VALUES
(1, 1, 1),
(1, 2, 1);
