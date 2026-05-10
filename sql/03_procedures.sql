CREATE OR REPLACE PROCEDURE sp_checkout (
  p_user_id    IN  NUMBER,
  p_address_id IN  NUMBER,
  p_coupon     IN  VARCHAR2 DEFAULT NULL,
  p_method     IN  VARCHAR2,
  p_order_id   OUT NUMBER
)
AS
  v_cart_id   NUMBER;
  v_total     NUMBER(10,2);
  v_discount  NUMBER(10,2) := 0;
  v_coup_id   NUMBER;
  v_dtype     VARCHAR2(10);
  v_dval      NUMBER(10,2);
BEGIN
  SELECT cart_id INTO v_cart_id
  FROM  cart WHERE user_id = p_user_id;

  SELECT SUM(ci.quantity * p.price) INTO v_total
  FROM  cart_items ci
  JOIN  products p ON ci.product_id = p.product_id
  WHERE ci.cart_id = v_cart_id;

  IF v_total IS NULL OR v_total = 0 THEN
    RAISE_APPLICATION_ERROR(-20010, 'Cart is empty');
  END IF;

  IF p_coupon IS NOT NULL THEN
    BEGIN
      SELECT coupon_id, discount_type, discount_value
      INTO  v_coup_id, v_dtype, v_dval
      FROM  coupons
      WHERE code = p_coupon
        AND is_active = 1
        AND expiry_date >= SYSDATE
        AND min_order_amt <= v_total;

      v_discount := CASE v_dtype
        WHEN 'percentage' THEN v_total * v_dval / 100
        ELSE v_dval
      END;
    EXCEPTION WHEN NO_DATA_FOUND THEN
      v_coup_id := NULL;
    END;
  END IF;

  INSERT INTO orders
    (user_id, address_id, coupon_id, total_amount, discount_applied)
  VALUES
    (p_user_id, p_address_id, v_coup_id,
     v_total - v_discount, v_discount)
  RETURNING order_id INTO p_order_id;

  INSERT INTO order_items (order_id, product_id, quantity, unit_price)
  SELECT p_order_id, ci.product_id, ci.quantity, p.price
  FROM  cart_items ci
  JOIN  products p ON ci.product_id = p.product_id
  WHERE ci.cart_id = v_cart_id;

  INSERT INTO payments (order_id, method, amount)
  VALUES (p_order_id, p_method, v_total - v_discount);

  DELETE FROM cart_items WHERE cart_id = v_cart_id;
  COMMIT;
EXCEPTION WHEN OTHERS THEN
  ROLLBACK;
  RAISE;
END;
/



CREATE OR REPLACE PROCEDURE sp_monthly_report (
  p_year   IN  NUMBER,
  p_month  IN  NUMBER,
  p_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
  OPEN p_cursor FOR
    SELECT
      p.name                              AS product,
      SUM(oi.quantity)                    AS units_sold,
      SUM(oi.quantity * oi.unit_price)    AS revenue,
      COUNT(DISTINCT o.order_id)          AS total_orders
    FROM  order_items oi
    JOIN  orders  o  ON oi.order_id  = o.order_id
    JOIN  products p ON oi.product_id = p.product_id
    WHERE EXTRACT(YEAR  FROM o.created_at) = p_year
      AND EXTRACT(MONTH FROM o.created_at) = p_month
      AND o.status != 'cancelled'
    GROUP BY p.product_id, p.name
    ORDER BY revenue DESC;
END;
/



CREATE OR REPLACE PROCEDURE sp_low_stock (
  p_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
  OPEN p_cursor FOR
    SELECT p.product_id, p.name,
           i.quantity, i.low_stock_threshold
    FROM  inventory i
    JOIN  products p ON i.product_id = p.product_id
    WHERE i.quantity <= i.low_stock_threshold
      AND p.is_active = 1
    ORDER BY i.quantity ASC;
END;
/