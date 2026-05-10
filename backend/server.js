const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { initPool } = require('./config/db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart',     require('./routes/cart'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/user',     require('./routes/auth'));
app.use('/api/reviews',  require('./routes/reviews'));

app.use((err, req, res, next) => {
  const message = err.message || 'Internal server error';
  res.status(500).json({ error: String(message) });
});

initPool().then(() => {
  app.listen(process.env.PORT, () =>
    console.log(`🚀 ShopNest on http://localhost:${process.env.PORT}`)
  );
}).catch(err => {
  console.error('Failed to start:', err.message);
});