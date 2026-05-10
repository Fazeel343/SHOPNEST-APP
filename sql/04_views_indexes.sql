CREATE OR REPLACE VIEW vw_customer_orders AS
SELECT
  u.user_id, u.full_name, u.email,
  COUNT(o.order_id)   AS total_orders,
  SUM(o.total_amount) AS lifetime_spend,
  MAX(o.created_at)   AS last_order_date
FROM  users u
LEFT JOIN orders o
  ON u.user_id = o.user_id AND o.status != 'cancelled'
GROUP BY u.user_id, u.full_name, u.email;


CREATE OR REPLACE VIEW vw_top_products AS
SELECT
  p.product_id, p.name,
  c.name                            AS category,
  SUM(oi.quantity)                  AS total_sold,
  SUM(oi.quantity * oi.unit_price)  AS total_revenue,
  ROUND(AVG(r.rating), 1)           AS avg_rating
FROM  products p
JOIN  order_items oi  ON p.product_id  = oi.product_id
JOIN  orders o        ON oi.order_id   = o.order_id
LEFT JOIN categories c  ON p.category_id = c.category_id
LEFT JOIN reviews r     ON p.product_id  = r.product_id
WHERE o.status != 'cancelled'
GROUP BY p.product_id, p.name, c.name
ORDER BY total_revenue DESC;


CREATE OR REPLACE VIEW vw_revenue_dashboard AS
SELECT
  TO_CHAR(created_at, 'YYYY-MM')            AS month,
  COUNT(*)                                    AS total_orders,
  SUM(total_amount)                           AS gross_revenue,
  SUM(discount_applied)                       AS total_discounts,
  SUM(total_amount) - SUM(discount_applied)  AS net_revenue
FROM  orders
WHERE status != 'cancelled'
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY month DESC;


CREATE INDEX idx_products_cat   ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_orders_user    ON orders(user_id);
CREATE INDEX idx_orders_status  ON orders(status);
CREATE INDEX idx_orders_date    ON orders(created_at);
CREATE INDEX idx_oi_order       ON order_items(order_id);
CREATE INDEX idx_oi_product     ON order_items(product_id);
CREATE INDEX idx_reviews_prod   ON reviews(product_id);
CREATE INDEX idx_inv_qty        ON inventory(quantity);