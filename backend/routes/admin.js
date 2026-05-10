const express  = require('express');
const db       = require('../config/db');
const auth     = require('../middleware/auth');
const oracledb = require('oracledb');
const router   = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Admins only' });
  next();
};

// GET /api/admin/report
router.get('/report', auth, adminOnly, async (req, res) => {
  const { year, month } = req.query;
  const conn = await db.getPool().getConnection();
  try {
    const result = await conn.execute(
      `BEGIN sp_monthly_report(:1, :2, :3); END;`,
      [
        Number(year),
        Number(month),
        { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      ]
    );
    const cursor = result.outBinds[0];
    const rows   = await cursor.getRows();
    await cursor.close();
    const formatted = rows.map(r => ({
      product:      r[0],
      units_sold:   r[1],
      revenue:      r[2],
      total_orders: r[3]
    }));
    res.json(formatted);
  } catch(e) {
    res.status(500).json({ error: e.message });
  } finally {
    await conn.close();
  }
});

// GET /api/admin/stock
router.get('/stock', auth, adminOnly, async (req, res) => {
  try {
    const r = await db.query(
      `SELECT p.product_id, p.name, i.quantity,
              i.low_stock_threshold,
              i.quantity - i.low_stock_threshold AS margin
       FROM inventory i
       JOIN products p ON i.product_id = p.product_id
       WHERE p.is_active = 1
       ORDER BY i.quantity ASC`,
      []
    );
    res.json(r.rows);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/admin/stock/:id
router.put('/stock/:id', auth, adminOnly, async (req, res) => {
  const { quantity } = req.body;
  try {
    await db.query(
      `UPDATE inventory SET quantity = :1 WHERE product_id = :2`,
      [Number(quantity), Number(req.params.id)]
    );
    res.json({ message: 'Stock updated!' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/orders
router.get('/orders', auth, adminOnly, async (req, res) => {
  try {
    const r = await db.query(
      `SELECT o.order_id, o.total_amount, o.status,
              o.created_at, u.full_name, u.email,
              p.method, p.status AS payment_status
       FROM orders o
       JOIN users    u ON o.user_id  = u.user_id
       JOIN payments p ON o.order_id = p.order_id
       ORDER BY o.created_at DESC`,
      []
    );
    res.json(r.rows);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/admin/orders/:id
router.put('/orders/:id', auth, adminOnly, async (req, res) => {
  const { status } = req.body;
  try {
    await db.query(
      `UPDATE orders SET status = :1 WHERE order_id = :2`,
      [status, Number(req.params.id)]
    );
    res.json({ message: 'Order updated!' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/dashboard
router.get('/dashboard', auth, adminOnly, async (req, res) => {
  try {
    const r = await db.query(
      `SELECT TO_CHAR(created_at, 'YYYY-MM') AS month,
              COUNT(*) AS total_orders,
              SUM(total_amount) AS gross_revenue,
              SUM(discount_applied) AS total_discounts,
              SUM(total_amount) - SUM(discount_applied) AS net_revenue
       FROM orders
       WHERE status != 'cancelled'
       GROUP BY TO_CHAR(created_at, 'YYYY-MM')
       ORDER BY month DESC
       FETCH FIRST 12 ROWS ONLY`,
      []
    );
    res.json(r.rows);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/coupons
router.get('/coupons', auth, adminOnly, async (req, res) => {
  try {
    const r = await db.query(
      `SELECT coupon_id, code, discount_type, discount_value,
              min_order_amt, expiry_date, is_active
       FROM coupons ORDER BY coupon_id DESC`,
      []
    );
    res.json(r.rows);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/coupons
router.post('/coupons', auth, adminOnly, async (req, res) => {
  const { code, discount_type, discount_value, min_order_amt, expiry_date } = req.body;
  try {
    await db.query(
      `INSERT INTO coupons (code, discount_type, discount_value, min_order_amt, expiry_date)
       VALUES (:1, :2, :3, :4, TO_DATE(:5, 'YYYY-MM-DD'))`,
      [code.toUpperCase(), discount_type, Number(discount_value),
       Number(min_order_amt) || 0, expiry_date]
    );
    res.json({ message: 'Coupon created!' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/admin/coupons/:id
router.delete('/coupons/:id', auth, adminOnly, async (req, res) => {
  try {
    await db.query(
      `UPDATE coupons SET is_active = 0 WHERE coupon_id = :1`,
      [Number(req.params.id)]
    );
    res.json({ message: 'Coupon deactivated!' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;