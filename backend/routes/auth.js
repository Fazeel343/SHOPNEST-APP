const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../config/db');
const authMW   = require('../middleware/auth');
const router   = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, full_name, phone } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO users (email, password_hash, full_name, phone)
       VALUES (:1, :2, :3, :4)`,
      [email, hash, full_name, phone || null]
    );
    res.json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query(
      `SELECT user_id, email, password_hash, full_name, role
       FROM users WHERE email = :1`,
      [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.PASSWORD_HASH);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.USER_ID, role: user.ROLE, name: user.FULL_NAME },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: {
      id:    user.USER_ID,
      name:  user.FULL_NAME,
      email: user.EMAIL,
      role:  user.ROLE
    }});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user/addresses
router.get('/addresses', authMW, async (req, res) => {
  try {
    const r = await db.query(
      `SELECT address_id, street, city, country, is_default
       FROM addresses WHERE user_id = :1
       ORDER BY is_default DESC`,
      [req.user.id]
    );
    res.json(r.rows);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/user/addresses
router.post('/addresses', authMW, async (req, res) => {
  const { street, city, postal_code, country } = req.body;
  try {
    const r = await db.query(
      `INSERT INTO addresses (user_id, street, city, postal_code, country)
       VALUES (:1, :2, :3, :4, :5)
       RETURNING address_id INTO :6`,
      [
        req.user.id, street, city, postal_code || null, country,
        { dir: require('oracledb').BIND_OUT, type: require('oracledb').NUMBER }
      ]
    );
    res.json({ address_id: r.outBinds[0] });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/reviews
router.post('/reviews', authMW, async (req, res) => {
  const { product_id, rating, review_comment } = req.body;
  try {
    await db.query(
      `INSERT INTO reviews (user_id, product_id, rating, review_comment)
       VALUES (:1, :2, :3, :4)`,
      [req.user.id, Number(product_id), Number(rating), review_comment || null]
    );
    res.json({ message: 'Review submitted!' });
  } catch(e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;