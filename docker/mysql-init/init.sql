-- Create categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- Create subcategories table
CREATE TABLE subcategories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_subcategory (category_id, name)
);

-- Create customers table
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stores table
CREATE TABLE stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    county VARCHAR(100),
    country VARCHAR(50) DEFAULT 'USA',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    region VARCHAR(50), -- Northeast, Southwest, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    subcategory_id INT,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)
);

-- Create transactions table (renamed and expanded to handle all transaction types)
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    product_id INT,
    store_id INT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'sale', 'refund', 'repair', 'service', 'trade_in'
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2),
    total_amount DECIMAL(10,2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'completed',
    notes TEXT,
    original_transaction_id INT, -- For refunds, links to original sale
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (original_transaction_id) REFERENCES transactions(id)
);

-- Insert categories
INSERT INTO categories (name, description) VALUES
('Hardware', 'Physical Apple products and accessories'),
('Services and Subscriptions', 'Apple services, warranties, and subscriptions'),
('Trade-Ins and Upgrades', 'Device trade-ins and upgrade programs'),
('Repairs, Genius Bar and Support', 'Repair services and technical support'),
('Third-Party Products', 'Non-Apple products and accessories');

-- Insert subcategories
INSERT INTO subcategories (category_id, name, description) VALUES
(1, 'iPhones', 'iPhone models'),
(1, 'Macs', 'Mac computers'),
(1, 'iPads', 'iPad tablets'),
(1, 'Apple Watch', 'Apple Watch devices'),
(1, 'Apple TV', 'Apple TV devices'),
(1, 'Chargers', 'Charging accessories'),
(1, 'Others', 'Other hardware accessories'),
(2, 'AppleCare+', 'Extended warranty service'),
(2, 'Subscriptions', 'Apple subscription services'),
(2, 'Apple Pay', 'Apple Pay services'),
(2, 'Apple Finance', 'Financing services'),
(3, 'old', 'Old device trade-ins'),
(3, 'refurbished', 'Refurbished device trade-ins'),
(4, 'Paid', 'Paid repair services'),
(4, 'Free', 'Free repair services'),
(5, 'Third-Party', 'Third-party products');

-- Insert sample customers
INSERT INTO customers (name, email, phone) VALUES
('John Doe', 'john.doe@email.com', '555-0101'),
('Jane Smith', 'jane.smith@email.com', '555-0102'),
('Bob Johnson', 'bob.johnson@email.com', '555-0103'),
('Sarah Williams', 'sarah.williams@email.com', '555-0104'),
('Michael Brown', 'michael.brown@email.com', '555-0105'),
('Emily Davis', 'emily.davis@email.com', '555-0106'),
('David Wilson', 'david.wilson@email.com', '555-0107'),
('Lisa Garcia', 'lisa.garcia@email.com', '555-0108'),
('James Miller', 'james.miller@email.com', '555-0109'),
('Jennifer Martinez', 'jennifer.martinez@email.com', '555-0110');

-- Insert sample stores
INSERT INTO stores (name, location, city, state, zip_code, county, country, latitude, longitude, region) VALUES
('Apple Store Downtown', '123 Main St, Downtown, CA', 'Los Angeles', 'CA', '90210', 'Los Angeles', 'USA', 34.052235, -118.243683, 'West'),
('Apple Store Mall', '456 Shopping Mall, Suite 100, NY', 'New York', 'NY', '10001', 'New York', 'USA', 40.712776, -74.005974, 'Northeast'),
('Apple Store Airport', '789 Airport Terminal, Gate A, TX', 'Dallas', 'TX', '75201', 'Dallas', 'USA', 32.776665, -96.796989, 'South'),
('Apple Store Plaza', '321 Plaza Drive, Suite 200, FL', 'Miami', 'FL', '33101', 'Miami-Dade', 'USA', 25.761680, -80.191790, 'South'),
('Apple Store Center', '654 Center Ave, Unit 10, WA', 'Seattle', 'WA', '98101', 'King', 'USA', 47.606209, -122.332071, 'West'),
('Apple Store Square', '987 Square Blvd, Level 2, IL', 'Chicago', 'IL', '60601', 'Cook', 'USA', 41.878113, -87.629799, 'Midwest');

-- Insert sample products
INSERT INTO products (name, category_id, subcategory_id, price, description) VALUES
('iPhone 15', 1, 1, 999.99, 'Latest iPhone model'),
('MacBook Pro', 1, 2, 1999.99, 'Professional laptop'),
('iPad Air', 1, 3, 599.00, 'Versatile tablet'),
('Apple Watch Series 9', 1, 4, 399.99, 'Latest smartwatch'),
('Apple TV 4K', 1, 5, 179.99, 'Streaming device'),
('USB-C Charger', 1, 6, 29.99, 'Fast charging accessory'),
('AirPods Pro', 1, 7, 249.99, 'Wireless earbuds'),
('AppleCare+ for iPhone', 2, 8, 149.99, 'Extended warranty'),
('Apple Music Subscription', 2, 9, 9.99, 'Monthly music subscription'),
('Apple Pay Setup', 2, 10, 0.00, 'Digital wallet setup'),
('iPhone Trade-in', 3, 12, -500.00, 'Trade-in credit for old iPhone'),
('Screen Repair', 4, 14, 129.99, 'Paid screen repair service');

-- Insert sample transactions (sales, refunds, repairs, services, trade-ins)
INSERT INTO transactions (customer_id, product_id, store_id, transaction_type, quantity, unit_price, total_amount, status, notes) VALUES
-- Sales
(1, 1, 1, 'sale', 1, 999.99, 999.99, 'completed', 'iPhone 15 purchase'),
(2, 2, 2, 'sale', 1, 1999.99, 1999.99, 'completed', 'MacBook Pro purchase'),
(3, 3, 1, 'sale', 2, 599.00, 1198.00, 'completed', 'iPad Air purchase'),
(1, 4, 3, 'sale', 1, 399.99, 399.99, 'completed', 'Apple Watch purchase'),
(2, 8, 2, 'sale', 1, 149.99, 149.99, 'completed', 'AppleCare+ purchase'),
(1, 7, 1, 'sale', 1, 249.99, 249.99, 'completed', 'AirPods Pro purchase'),
(3, 5, 3, 'sale', 1, 179.99, 179.99, 'completed', 'Apple TV purchase');

-- Refunds (need original_transaction_id column)
INSERT INTO transactions (customer_id, product_id, store_id, transaction_type, quantity, unit_price, total_amount, status, notes, original_transaction_id) VALUES
(1, 1, 1, 'refund', 1, -999.99, -999.99, 'completed', 'iPhone 15 refund - defective', 1),
(2, 2, 2, 'refund', 1, -1999.99, -1999.99, 'completed', 'MacBook Pro refund - customer change of mind', 2);

-- Repairs
INSERT INTO transactions (customer_id, product_id, store_id, transaction_type, quantity, unit_price, total_amount, status, notes) VALUES
(1, NULL, 1, 'repair', 1, 129.99, 129.99, 'completed', 'Screen repair for iPhone'),
(2, NULL, 2, 'repair', 1, 89.99, 89.99, 'completed', 'Battery replacement for MacBook'),
(3, NULL, 1, 'repair', 1, 0.00, 0.00, 'completed', 'Free warranty repair for iPad');

-- Services
INSERT INTO transactions (customer_id, product_id, store_id, transaction_type, quantity, unit_price, total_amount, status, notes) VALUES
(1, 9, 1, 'service', 1, 9.99, 9.99, 'completed', 'Apple Music subscription setup'),
(2, 10, 2, 'service', 1, 0.00, 0.00, 'completed', 'Apple Pay setup service');

-- Trade-ins
INSERT INTO transactions (customer_id, product_id, store_id, transaction_type, quantity, unit_price, total_amount, status, notes) VALUES
(1, 11, 1, 'trade_in', 1, -500.00, -500.00, 'completed', 'iPhone trade-in credit'),
(3, 11, 3, 'trade_in', 1, -300.00, -300.00, 'completed', 'iPad trade-in credit');

-- ===========================================
-- STORED PROCEDURES FOR AGGREGATIONS
-- ===========================================

DELIMITER //

-- Procedure to get overall transaction statistics
CREATE PROCEDURE GetTransactionStats()
BEGIN
    SELECT
        COUNT(*) as total_transactions,
        SUM(CASE WHEN transaction_type = 'sale' THEN total_amount ELSE 0 END) as total_sales_revenue,
        SUM(CASE WHEN transaction_type = 'refund' THEN ABS(total_amount) ELSE 0 END) as total_refund_amount,
        SUM(CASE WHEN transaction_type = 'repair' THEN total_amount ELSE 0 END) as total_repair_revenue,
        SUM(CASE WHEN transaction_type = 'service' THEN total_amount ELSE 0 END) as total_service_revenue,
        SUM(CASE WHEN transaction_type = 'trade_in' THEN total_amount ELSE 0 END) as total_trade_in_value,
        AVG(CASE WHEN transaction_type = 'sale' THEN total_amount ELSE NULL END) as avg_sale_amount,
        MAX(transaction_date) as last_transaction_date,
        MIN(transaction_date) as first_transaction_date
    FROM transactions
    WHERE status = 'completed';
END //

-- Procedure to get transaction type breakdown
CREATE PROCEDURE GetTransactionTypeStats()
BEGIN
    SELECT
        transaction_type,
        COUNT(*) as transaction_count,
        SUM(total_amount) as total_amount,
        AVG(total_amount) as avg_amount,
        MIN(total_amount) as min_amount,
        MAX(total_amount) as max_amount
    FROM transactions
    WHERE status = 'completed'
    GROUP BY transaction_type
    ORDER BY total_amount DESC;
END //

-- Procedure to get category performance
CREATE PROCEDURE GetCategoryStats()
BEGIN
    SELECT
        COALESCE(cat.name, 'No Category') as category_name,
        COUNT(t.id) as transaction_count,
        SUM(t.total_amount) as total_revenue,
        AVG(t.total_amount) as avg_transaction_amount,
        COUNT(DISTINCT t.customer_id) as unique_customers,
        COUNT(DISTINCT t.product_id) as unique_products
    FROM transactions t
    LEFT JOIN products p ON t.product_id = p.id
    LEFT JOIN categories cat ON p.category_id = cat.id
    WHERE t.status = 'completed'
    GROUP BY cat.id, cat.name
    ORDER BY total_revenue DESC;
END //

-- Procedure to get subcategory performance
CREATE PROCEDURE GetSubcategoryStats()
BEGIN
    SELECT
        COALESCE(cat.name, 'No Category') as category_name,
        COALESCE(sub.name, 'No Subcategory') as subcategory_name,
        COUNT(t.id) as transaction_count,
        SUM(t.total_amount) as total_revenue,
        AVG(t.total_amount) as avg_transaction_amount,
        COUNT(DISTINCT t.customer_id) as unique_customers
    FROM transactions t
    LEFT JOIN products p ON t.product_id = p.id
    LEFT JOIN categories cat ON p.category_id = cat.id
    LEFT JOIN subcategories sub ON p.subcategory_id = sub.id
    WHERE t.status = 'completed'
    GROUP BY cat.id, cat.name, sub.id, sub.name
    ORDER BY total_revenue DESC;
END //

-- Procedure to get store performance
CREATE PROCEDURE GetStoreStats()
BEGIN
    SELECT
        s.name as store_name,
        s.location as store_location,
        COUNT(t.id) as transaction_count,
        SUM(t.total_amount) as total_revenue,
        AVG(t.total_amount) as avg_transaction_amount,
        COUNT(DISTINCT t.customer_id) as unique_customers,
        COUNT(DISTINCT t.product_id) as unique_products
    FROM transactions t
    JOIN stores s ON t.store_id = s.id
    WHERE t.status = 'completed'
    GROUP BY s.id, s.name, s.location
    ORDER BY total_revenue DESC;
END //

-- Procedure to get product performance
CREATE PROCEDURE GetProductStats()
BEGIN
    SELECT
        p.name as product_name,
        cat.name as category_name,
        sub.name as subcategory_name,
        COUNT(t.id) as transaction_count,
        SUM(t.quantity) as total_quantity_sold,
        SUM(t.total_amount) as total_revenue,
        AVG(t.unit_price) as avg_unit_price,
        MIN(t.unit_price) as min_unit_price,
        MAX(t.unit_price) as max_unit_price
    FROM transactions t
    JOIN products p ON t.product_id = p.id
    LEFT JOIN categories cat ON p.category_id = cat.id
    LEFT JOIN subcategories sub ON p.subcategory_id = sub.id
    WHERE t.status = 'completed' AND t.transaction_type = 'sale'
    GROUP BY p.id, p.name, cat.name, sub.name
    ORDER BY total_revenue DESC;
END //

-- Procedure to get daily revenue trends (last 30 days)
CREATE PROCEDURE GetDailyRevenue(IN days_back INT)
BEGIN
    SELECT
        DATE(transaction_date) as transaction_date,
        COUNT(*) as transaction_count,
        SUM(total_amount) as daily_revenue,
        AVG(total_amount) as avg_transaction_amount
    FROM transactions
    WHERE status = 'completed'
        AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL days_back DAY)
    GROUP BY DATE(transaction_date)
    ORDER BY transaction_date DESC;
END //

-- Procedure to get customer analytics
CREATE PROCEDURE GetCustomerStats()
BEGIN
    SELECT
        c.name as customer_name,
        c.email,
        COUNT(t.id) as total_transactions,
        SUM(t.total_amount) as total_spent,
        AVG(t.total_amount) as avg_transaction_amount,
        MIN(t.transaction_date) as first_purchase_date,
        MAX(t.transaction_date) as last_purchase_date,
        COUNT(DISTINCT DATE(t.transaction_date)) as active_days
    FROM customers c
    LEFT JOIN transactions t ON c.id = t.customer_id AND t.status = 'completed'
    GROUP BY c.id, c.name, c.email
    HAVING total_transactions > 0
    ORDER BY total_spent DESC;
END //

-- Procedure to get revenue by time periods
CREATE PROCEDURE GetRevenueByPeriod(IN period_type VARCHAR(20))
BEGIN
    SELECT
        CASE
            WHEN period_type = 'hourly' THEN DATE_FORMAT(transaction_date, '%Y-%m-%d %H:00:00')
            WHEN period_type = 'daily' THEN DATE_FORMAT(transaction_date, '%Y-%m-%d')
            WHEN period_type = 'weekly' THEN DATE_FORMAT(transaction_date, '%Y-%W')
            WHEN period_type = 'monthly' THEN DATE_FORMAT(transaction_date, '%Y-%m')
            WHEN period_type = 'yearly' THEN DATE_FORMAT(transaction_date, '%Y')
            ELSE DATE_FORMAT(transaction_date, '%Y-%m-%d')
        END as period,
        COUNT(*) as transaction_count,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_transaction_amount
    FROM transactions
    WHERE status = 'completed'
    GROUP BY
        CASE
            WHEN period_type = 'hourly' THEN DATE_FORMAT(transaction_date, '%Y-%m-%d %H:00:00')
            WHEN period_type = 'daily' THEN DATE_FORMAT(transaction_date, '%Y-%m-%d')
            WHEN period_type = 'weekly' THEN DATE_FORMAT(transaction_date, '%Y-%W')
            WHEN period_type = 'monthly' THEN DATE_FORMAT(transaction_date, '%Y-%m')
            WHEN period_type = 'yearly' THEN DATE_FORMAT(transaction_date, '%Y')
            ELSE DATE_FORMAT(transaction_date, '%Y-%m-%d')
        END
    ORDER BY period DESC;
END //

DELIMITER ;



-- Grant necessary privileges to cdc_user for Debezium
GRANT RELOAD, REPLICATION CLIENT, REPLICATION SLAVE ON *.* TO 'cdc_user'@'%';
FLUSH PRIVILEGES;
