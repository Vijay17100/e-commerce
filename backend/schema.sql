-- E-commerce Database Schema

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Create Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price FLOAT NOT NULL
);

-- Create Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert dummy products for testing
INSERT INTO products (name, description, price) VALUES
('Wireless Earbuds', 'High-quality noise-canceling wireless earbuds with 20-hour battery life.', 99.99),
('Mechanical Keyboard', 'RGB backlit mechanical keyboard with blue switches.', 89.50),
('Gaming Mouse', 'Ergonomic gaming mouse with 16000 DPI sensor and programmable buttons.', 49.99),
('4K Monitor', '27-inch 4K UHD monitor with IPS panel and ultra-thin bezels.', 349.00),
('Smartwatch', 'Fitness tracking smartwatch with heart rate monitor.', 199.99)
ON CONFLICT DO NOTHING;
