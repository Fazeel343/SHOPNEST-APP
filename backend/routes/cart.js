const express = require('express');
const db      = require('../config/db');
const auth    = require('../middleware/auth');
const router  = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const r = await db.query(
      `SELECT ci.cart_item_id, ci.quantity,
              p.product_id, p.name, p.price,
              ci.quantity * p.price AS subtotal
       FROM cart c
       JOIN cart_items ci ON c.cart_id     = ci.cart_id
       JOIN products   p  ON ci.product_id = p.product_id
       WHERE c.user_id = :1`,
      [req.user.id]
    );
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  try {
    const cartR = await db.query(
      `SELECT cart_id FROM cart WHERE user_id = :1`,
      [req.user.id]
    );
    const cart_id = cartR.rows[0].CART_ID;

    const existing = await db.query(
      `SELECT cart_item_id FROM cart_items 
       WHERE cart_id = :1 AND product_id = :2`,
      [cart_id, product_id]
    );

    if (existing.rows.length > 0) {
      await db.query(
        `UPDATE cart_items 
         SET quantity = quantity + :1
         WHERE cart_item_id = :2`,
        [quantity, existing.rows[0].CART_ITEM_ID]
      );
    } else {
      await db.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity)
         VALUES (:1, :2, :3)`,
        [cart_id, product_id, quantity]
      );
    }

    res.json({ message: 'Added to cart' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query(
      `DELETE FROM cart_items WHERE cart_item_id = :1`,
      [req.params.id]
    );
    res.json({ message: 'Removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;