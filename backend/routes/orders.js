const express  = require('express');
const db       = require('../config/db');
const auth     = require('../middleware/auth');
const oracledb = require('oracledb');
const router   = express.Router();

router.post('/checkout', auth, async (req, res) => {
  const { address_id, coupon_code, payment_method } = req.body;
  const conn = await db.getPool().getConnection();
  try {
    const result = await conn.execute(
      `BEGIN sp_checkout(:1, :2, :3, :4, :5); END;`,
      [
        { val: Number(req.user.id),  dir: oracledb.BIND_IN,  type: oracledb.NUMBER },
        { val: Number(address_id),   dir: oracledb.BIND_IN,  type: oracledb.NUMBER },
        { val: coupon_code || null,  dir: oracledb.BIND_IN,  type: oracledb.STRING },
        { val: payment_method,       dir: oracledb.BIND_IN,  type: oracledb.STRING },
        {                            dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      ],
      { autoCommit: false }
    );
    await conn.commit();
    const orderId = result.outBinds[4];

    const orderR = await conn.execute(
      `SELECT total_amount, discount_applied
       FROM orders WHERE order_id = :1`,
      [orderId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const order = orderR.rows[0];

    res.json({
      success:          true,
      order_id:         orderId,
      total_amount:     order ? order.TOTAL_AMOUNT     : 0,
      discount_applied: order ? order.DISCOUNT_APPLIED : 0
    });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    await conn.close();
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const r = await db.query(
      `SELECT o.order_id, o.total_amount, o.status,
              o.discount_applied, o.created_at,
              p.status AS payment_status, p.method
       FROM orders o
       JOIN payments p ON o.order_id = p.order_id
       WHERE o.user_id = :1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify coupon
router.post('/verify-coupon', auth, async (req, res) => {
  const { coupon_code, total } = req.body;
  try {
    const r = await db.query(
      `SELECT coupon_id, discount_type, discount_value
       FROM coupons
       WHERE code = :1
       AND is_active = 1
       AND expiry_date >= SYSDATE
       AND min_order_amt <= :2`,
      [coupon_code, Number(total)]
    );
    if (r.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired coupon!' });
    }
    const c = r.rows[0];
    const discount = c.DISCOUNT_TYPE === 'percentage'
      ? (Number(total) * c.DISCOUNT_VALUE / 100)
      : c.DISCOUNT_VALUE;
    res.json({
      valid:    true,
      discount: discount,
      final:    Number(total) - discount
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;