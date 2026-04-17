const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 中間件
app.use(cors());
app.use(express.json());

// PostgreSQL 連接
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'petfood'
});

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ===== 商品 API =====

/**
 * 獲取所有商品
 */
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 獲取單個商品
 */
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 創建商品
 */
app.post('/api/products', async (req, res) => {
  const { name, price, stock, discount, image, description } = req.body;
  
  // 驗證必填字段
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO products (name, price, stock, discount, image, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, parseFloat(price), parseInt(stock) || 0, parseFloat(discount) || 0, image || '', description || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 更新商品
 */
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, stock, discount, image, description } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE products SET name=$1, price=$2, stock=$3, discount=$4, image=$5, description=$6 WHERE id=$7 RETURNING *',
      [name, parseFloat(price), parseInt(stock) || 0, parseFloat(discount) || 0, image || '', description || '', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 刪除商品
 */
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM products WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== 設置 API =====

/**
 * 獲取設置
 */
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM app_settings WHERE id=$1', ['main']);
    if (result.rows.length === 0) {
      // 返回默認設置
      return res.json({
        id: 'main',
        shipping_fee: 15,
        free_shipping_threshold: 200,
        whatsapp_number: ''
      });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 更新設置
 */
app.post('/api/settings', async (req, res) => {
  const { shipping_fee, free_shipping_threshold, whatsapp_number } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO app_settings (id, shipping_fee, free_shipping_threshold, whatsapp_number) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET shipping_fee=$2, free_shipping_threshold=$3, whatsapp_number=$4, updated_at=now() RETURNING *',
      ['main', parseFloat(shipping_fee), parseFloat(free_shipping_threshold), whatsapp_number || '']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: err.message });
  }
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 啟動服務器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// 優雅關閉
process.on('SIGTERM', () => {
  pool.end(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});
