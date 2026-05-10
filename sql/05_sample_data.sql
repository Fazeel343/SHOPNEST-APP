INSERT INTO categories (name, description)
VALUES ('Electronics', 'Phones, laptops, gadgets');
INSERT INTO categories (name, description)
VALUES ('Clothing', 'Men and women fashion');
INSERT INTO categories (name, description)
VALUES ('Books', 'Academic and fiction books');



INSERT INTO users (email, password_hash, full_name, role)
VALUES ('admin@shopnest.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'Admin User', 'admin');



INSERT INTO users (email, password_hash, full_name)
VALUES ('ali@example.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'Ali Khan');



INSERT INTO products (category_id, name, description, price)
VALUES (1, 'Samsung Galaxy S24', 'Latest Samsung flagship phone', 189999);
INSERT INTO products (category_id, name, description, price)
VALUES (1, 'Dell XPS 15 Laptop', 'Intel i7, 16GB RAM, 512GB SSD', 349999);
INSERT INTO products (category_id, name, description, price)
VALUES (2, 'Classic White Shirt', 'Premium cotton formal shirt', 2999);
INSERT INTO products (category_id, name, description, price)
VALUES (3, 'DBMS Fundamentals', 'Database textbook by Ramez Elmasri', 4500);



INSERT INTO inventory (product_id, quantity, low_stock_threshold)
VALUES (1, 50, 5);
INSERT INTO inventory (product_id, quantity, low_stock_threshold)
VALUES (2, 20, 3);
INSERT INTO inventory (product_id, quantity, low_stock_threshold)
VALUES (3, 100, 10);
INSERT INTO inventory (product_id, quantity, low_stock_threshold)
VALUES (4, 30, 5);



INSERT INTO addresses (user_id, street, city, country, is_default)
VALUES (2, 'House 5, Block 9, Gulshan', 'Karachi', 'Pakistan', 1);



INSERT INTO coupons (code, discount_type, discount_value, expiry_date)
VALUES ('NUCES20', 'percentage', 20,
        TO_DATE('2025-12-31', 'YYYY-MM-DD'));

COMMIT;