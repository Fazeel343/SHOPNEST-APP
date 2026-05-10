CREATE OR REPLACE TRIGGER trg_create_cart
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  INSERT INTO cart (user_id) VALUES (:NEW.user_id);
END;
/



CREATE OR REPLACE TRIGGER trg_decrement_inventory
AFTER INSERT ON order_items
FOR EACH ROW
DECLARE
  v_qty NUMBER;
BEGIN
  UPDATE inventory
  SET quantity   = quantity - :NEW.quantity,
      updated_at = SYSTIMESTAMP
  WHERE product_id = :NEW.product_id;

  SELECT quantity INTO v_qty
  FROM  inventory
  WHERE product_id = :NEW.product_id;

  IF v_qty < 0 THEN
    RAISE_APPLICATION_ERROR(-20001,
      'Insufficient stock for product: ' || :NEW.product_id);
  END IF;
END;
/



CREATE OR REPLACE TRIGGER trg_restore_inventory
AFTER UPDATE OF status ON orders
FOR EACH ROW
BEGIN
  IF :NEW.status = 'cancelled' AND :OLD.status != 'cancelled' THEN
    UPDATE inventory i
    SET i.quantity = i.quantity + (
      SELECT oi.quantity
      FROM  order_items oi
      WHERE oi.order_id  = :NEW.order_id
        AND oi.product_id = i.product_id
    )
    WHERE i.product_id IN (
      SELECT product_id FROM order_items
      WHERE order_id = :NEW.order_id
    );
  END IF;
END;
/



CREATE OR REPLACE TRIGGER trg_payment_on_delivery
AFTER UPDATE OF status ON orders
FOR EACH ROW
BEGIN
  IF :NEW.status = 'delivered' AND :OLD.status != 'delivered' THEN
    UPDATE payments
    SET status  = 'completed',
        paid_at = SYSTIMESTAMP
    WHERE order_id = :NEW.order_id
      AND status   = 'pending';
  END IF;
END;
/



CREATE OR REPLACE TRIGGER trg_validate_review
BEFORE INSERT ON reviews
FOR EACH ROW
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM  orders o
  JOIN  order_items oi ON o.order_id = oi.order_id
  WHERE o.user_id    = :NEW.user_id
    AND oi.product_id = :NEW.product_id
    AND o.status      = 'delivered';

  IF v_count = 0 THEN
    RAISE_APPLICATION_ERROR(-20002,
      'You can only review products you have purchased.');
  END IF;
END;
/



CREATE OR REPLACE TRIGGER trg_inventory_timestamp
BEFORE UPDATE ON inventory
FOR EACH ROW
BEGIN
  :NEW.updated_at := SYSTIMESTAMP;
END;
/