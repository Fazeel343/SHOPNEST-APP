const express = require('express');
const db      = require('../config/db');
const router  = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = `SELECT p.product_id, p.name, p.price, p.description,
                      c.name AS category, i.quantity,
                      (SELECT pi.image_url FROM product_images pi
                       WHERE pi.product_id = p.product_id
                       AND pi.is_primary = 1
                       AND ROWNUM = 1) AS image_url,
                      ROUND((SELECT AVG(r.rating) FROM reviews r
                             WHERE r.product_id = p.product_id), 1) AS avg_rating
               FROM products p
               LEFT JOIN categories c ON p.category_id = c.category_id
               LEFT JOIN inventory i  ON p.product_id  = i.product_id
               WHERE p.is_active = 1`;

    const binds = [];
    if (search && search.trim() !== '') {
      sql += ` AND UPPER(p.name) LIKE UPPER(:${binds.length + 1})`;
      binds.push(`%${search}%`);
    }
    if (category && category.trim() !== '') {
      sql += ` AND p.category_id = :${binds.length + 1}`;
      binds.push(category);
    }
    sql += ` ORDER BY p.created_at DESC`;

    const result = await db.query(sql, binds);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const prod = await db.query(
      `SELECT p.product_id, p.name, p.price, p.description,
              c.name AS category, i.quantity,
              ROUND((SELECT AVG(rating) FROM reviews r 
                    WHERE r.product_id = p.product_id), 1) AS avg_rating
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN inventory i  ON p.product_id  = i.product_id
      WHERE p.product_id = :id AND p.is_active = 1`,
      [req.params.id]
    );
    const images = await db.query(
      `SELECT image_id, image_url, is_primary
       FROM product_images WHERE product_id = :id`,
      [req.params.id]
    );
    const revs = await db.query(
      `SELECT r.rating, r.review_comment, r.created_at, u.full_name
       FROM reviews r JOIN users u ON r.user_id = u.user_id
       WHERE r.product_id = :id ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    res.json({
      ...prod.rows[0],
      images: images.rows,
      reviews: revs.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET categories for dropdown
router.get('/categories/all', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT category_id, name FROM categories ORDER BY name`,
      []
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;