const express = require('express');
const db      = require('../config/db');
const auth    = require('../middleware/auth');
const router  = express.Router();

router.post('/', auth, async (req, res) => {
  const { product_id, rating, review_comment } = req.body;
  try {
    // Check if user already rated this product
    const existing = await db.query(
      `SELECT review_id FROM reviews
       WHERE user_id = :1 AND product_id = :2`,
      [req.user.id, Number(product_id)]
    );

    if (existing.rows.length > 0) {
      // Already rated — only update comment, keep original rating
      await db.query(
        `UPDATE reviews SET review_comment = :1
         WHERE user_id = :2 AND product_id = :3`,
        [review_comment || null, req.user.id, Number(product_id)]
      );
      res.json({ message: 'Comment updated! Rating unchanged.' });
    } else {
      // New review — insert with rating
      await db.query(
        `INSERT INTO reviews (user_id, product_id, rating, review_comment)
         VALUES (:1, :2, :3, :4)`,
        [req.user.id, Number(product_id), Number(rating), review_comment || null]
      );
      res.json({ message: 'Review submitted!' });
    }
  } catch(e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;