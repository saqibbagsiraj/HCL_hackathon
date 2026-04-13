-- =========================
-- 1. ROLES TABLE
-- =========================
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (name) VALUES 
('USER'),
('ADMIN'),
('RESTAURANT');


-- =========================
-- 2. USERS TABLE
-- =========================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- bcrypt hashed
    phone VARCHAR(15),
    address TEXT,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- Index for fast login
CREATE INDEX idx_users_email ON users(email);


-- =========================
-- 3. RESTAURANTS TABLE
-- =========================
CREATE TABLE restaurants (
    restaurant_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    owner_id INT NOT NULL,
    rating DECIMAL(2,1) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_id) REFERENCES users(user_id)
);

CREATE INDEX idx_restaurant_owner ON restaurants(owner_id);


-- =========================
-- 4. MENU ITEMS TABLE
-- =========================
CREATE TABLE menu_items (
    item_id SERIAL PRIMARY KEY,
    restaurant_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
);

CREATE INDEX idx_menu_restaurant ON menu_items(restaurant_id);


-- =========================
-- 5. ORDERS TABLE
-- =========================
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),

    CHECK (status IN ('PLACED', 'CONFIRMED', 'PREPARING', 'DELIVERED', 'CANCELLED'))
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);


-- =========================
-- 6. ORDER ITEMS TABLE
-- =========================
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),

    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);


-- =========================
-- 7. SAMPLE DATA (SAFE FORMAT)
-- =========================

-- USERS (password should be bcrypt from backend)
INSERT INTO users (name, email, password, role_id)
VALUES 
('Diya', 'diya@gmail.com', '$2a$10$hashedpasswordexample', 1);

-- RESTAURANT OWNER (must be role RESTAURANT)
INSERT INTO users (name, email, password, role_id)
VALUES 
('Owner1', 'owner@gmail.com', '$2a$10$hashedpasswordexample', 3);

-- RESTAURANT
INSERT INTO restaurants (name, location, owner_id)
VALUES 
('Pizza Hut', 'Bangalore', 2),
('KFC', 'Bangalore', 2);

-- MENU
INSERT INTO menu_items (restaurant_id, name, description, price)
VALUES 
(1, 'Veg Pizza', 'Cheesy veg pizza', 250),
(1, 'Cheese Pizza', 'Extra cheese', 300),
(2, 'Chicken Bucket', 'Crispy chicken', 500);

-- ORDER
INSERT INTO orders (user_id, restaurant_id, total_amount, status)
VALUES 
(1, 1, 550, 'PLACED');

-- ORDER ITEMS
INSERT INTO order_items (order_id, item_id, quantity)
VALUES 
(1, 1, 1),
(1, 3, 1);


-- =========================
-- 8. REPORT QUERY (JOIN)
-- =========================
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
JOIN menu_items m ON oi.item_id = m.item_id;
