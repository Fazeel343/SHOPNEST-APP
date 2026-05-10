CREATE TABLE users (
  user_id       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         VARCHAR2(150) NOT NULL UNIQUE,
  password_hash VARCHAR2(255) NOT NULL,
  full_name     VARCHAR2(100) NOT NULL,
  phone         VARCHAR2(20),
  role          VARCHAR2(10) DEFAULT 'customer'
                  CONSTRAINT chk_role
                  CHECK (role IN ('customer', 'admin')),
  created_at    TIMESTAMP DEFAULT SYSTIMESTAMP,
  CONSTRAINT chk_email CHECK (email LIKE '%@%.%')
);


CREATE TABLE addresses (
  address_id  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     NUMBER NOT NULL,
  street      VARCHAR2(255) NOT NULL,
  city        VARCHAR2(100) NOT NULL,
  state       VARCHAR2(100),
  postal_code VARCHAR2(20),
  country     VARCHAR2(100) NOT NULL,
  is_default  NUMBER(1) DEFAULT 0
                CONSTRAINT chk_isdef
                CHECK (is_default IN (0, 1)),
  CONSTRAINT fk_addr_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
);


CREATE TABLE categories (
  category_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        VARCHAR2(100) NOT NULL UNIQUE,
  parent_id   NUMBER DEFAULT NULL,
  description CLOB,
  CONSTRAINT fk_cat_parent
    FOREIGN KEY (parent_id) REFERENCES categories(category_id)
    ON DELETE SET NULL
);


CREATE TABLE products (
  product_id  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id NUMBER,
  name        VARCHAR2(200) NOT NULL,
  description CLOB,
  price       NUMBER(10,2) NOT NULL,
  is_active   NUMBER(1) DEFAULT 1
                CONSTRAINT chk_active
                CHECK (is_active IN (0, 1)),
  created_at  TIMESTAMP DEFAULT SYSTIMESTAMP,
  CONSTRAINT fk_prod_cat
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
    ON DELETE SET NULL,
  CONSTRAINT chk_price CHECK (price >= 0)
);


CREATE TABLE inventory (
  inventory_id        NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id          NUMBER NOT NULL UNIQUE,
  quantity            NUMBER DEFAULT 0 NOT NULL,
  low_stock_threshold NUMBER DEFAULT 5 NOT NULL,
  updated_at          TIMESTAMP DEFAULT SYSTIMESTAMP,
  CONSTRAINT fk_inv_prod
    FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON DELETE CASCADE,
  CONSTRAINT chk_inv_qty CHECK (quantity >= 0)
);


CREATE TABLE product_images (
  image_id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id NUMBER NOT NULL,
  image_url  VARCHAR2(500) NOT NULL,
  is_primary NUMBER(1) DEFAULT 0
               CONSTRAINT chk_primary
               CHECK (is_primary IN (0, 1)),
  CONSTRAINT fk_img_prod
    FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON DELETE CASCADE
);


CREATE TABLE coupons (
  coupon_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code           VARCHAR2(50) NOT NULL UNIQUE,
  discount_type  VARCHAR2(10) NOT NULL
                   CONSTRAINT chk_dtype
                   CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMBER(10,2) NOT NULL,
  min_order_amt  NUMBER(10,2) DEFAULT 0,
  expiry_date    DATE NOT NULL,
  is_active      NUMBER(1) DEFAULT 1
                   CONSTRAINT chk_coup_a
                   CHECK (is_active IN (0, 1)),
  CONSTRAINT chk_dval CHECK (discount_value > 0)
);


CREATE TABLE cart (
  cart_id    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    NUMBER NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  CONSTRAINT fk_cart_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
);


CREATE TABLE cart_items (
  cart_item_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cart_id      NUMBER NOT NULL,
  product_id   NUMBER NOT NULL,
  quantity     NUMBER DEFAULT 1 NOT NULL,
  CONSTRAINT uq_cart_prod UNIQUE (cart_id, product_id),
  CONSTRAINT fk_ci_cart
    FOREIGN KEY (cart_id) REFERENCES cart(cart_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_ci_prod
    FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON DELETE CASCADE,
  CONSTRAINT chk_ci_qty CHECK (quantity > 0)
);


CREATE TABLE orders (
  order_id         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id          NUMBER NOT NULL,
  address_id       NUMBER NOT NULL,
  coupon_id        NUMBER DEFAULT NULL,
  total_amount     NUMBER(10,2) NOT NULL,
  discount_applied NUMBER(10,2) DEFAULT 0,
  status           VARCHAR2(20) DEFAULT 'pending'
                     CONSTRAINT chk_status CHECK
                     (status IN ('pending','confirmed',
                                  'shipped','delivered','cancelled')),
  created_at       TIMESTAMP DEFAULT SYSTIMESTAMP,
  CONSTRAINT fk_ord_user
    FOREIGN KEY (user_id) REFERENCES users(user_id),
  CONSTRAINT fk_ord_addr
    FOREIGN KEY (address_id) REFERENCES addresses(address_id),
  CONSTRAINT fk_ord_coup
    FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id)
    ON DELETE SET NULL
);


CREATE TABLE order_items (
  order_item_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id      NUMBER NOT NULL,
  product_id    NUMBER NOT NULL,
  quantity      NUMBER NOT NULL,
  unit_price    NUMBER(10,2) NOT NULL,
  CONSTRAINT fk_oi_order
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_oi_prod
    FOREIGN KEY (product_id) REFERENCES products(product_id),
  CONSTRAINT chk_oi_qty CHECK (quantity > 0)
);


CREATE TABLE payments (
  payment_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id        NUMBER NOT NULL UNIQUE,
  method          VARCHAR2(20) NOT NULL
                    CONSTRAINT chk_method CHECK
                    (method IN ('credit_card','debit_card',
                                 'easypaisa','jazzcash','cod')),
  status          VARCHAR2(10) DEFAULT 'pending'
                    CONSTRAINT chk_pay_st CHECK
                    (status IN ('pending','completed',
                                 'failed','refunded')),
  amount          NUMBER(10,2) NOT NULL,
  transaction_ref VARCHAR2(100),
  paid_at         TIMESTAMP,
  CONSTRAINT fk_pay_order
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
    ON DELETE CASCADE
);


CREATE TABLE reviews (
  review_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id        NUMBER NOT NULL,
  product_id     NUMBER NOT NULL,
  rating         NUMBER NOT NULL,
  review_comment CLOB,
  created_at     TIMESTAMP DEFAULT SYSTIMESTAMP,
  CONSTRAINT uq_review UNIQUE (user_id, product_id),
  CONSTRAINT fk_rev_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_rev_prod
    FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON DELETE CASCADE,
  CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5)
);

