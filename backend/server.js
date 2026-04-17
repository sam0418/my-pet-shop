const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

// 匯入中介軟體
const { authenticateToken, generateToken, JWT_SECRET } = require('./middleware/auth');
const { validateRequest, productSchema, settingsSchema, loginSchema } = require('./middleware/validation');
const { errorHandler, notFoundHandler, asyncHandler } = require('./middleware/errorHandler');

const app = express();

// ===== 驗證環境變數 =====
const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'DB_NAME'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

// ===== CORS 設定（固定白名單） =====
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600
}));

// ===== 日誌中介軟體 =====
app.use(morgan('combined'));

// ===== 請求限速 =====
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 100, // 最多100個請求
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' // 不限速健康檢查
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 登入最多5次
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again after 15 minutes'
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

// ===== 基本中介軟體 =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== PostgreSQL 連接 =====
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

// ===== 健康檢查 =====
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

// ===== 認證 API =====

/**
 * 登入並取得 JWT 令牌
 * POST /api/auth/login
 */
app.post('/api/auth/login', validateRequest(loginSchema), asyncHandler(async (req, res) => {
  const { username, password } = req.validatedBody;
  
  // TODO: 從資料庫驗證用戶（當前為簡單驗證）
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD_HASH = '$2a$10$7nJ4d8KkZ.KZL.2mPFAWx.p.P4JxdKqDOzK5Uu7PvJ5K8ZvL5z0oC'; // bcrypt hash of 'admin'
  
  if (username !== ADMIN_USERNAME) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  
  // 驗證密碼
  const passwordMatch = await bcryptjs.compare(password, ADMIN_PASSWORD_HASH);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  
  // 生成 JWT 令牌
  const token = generateToken({
    id: 1,
    username: ADMIN_USERNAME,
    role: 'admin'
  });
  
  res.json({
    success: true,
    token,
    expiresIn: '24h',
    user: { username: ADMIN_USERNAME, role: 'admin' }
  });
}));

// ===== 公開 API =====

/**
 * 獲取所有商品
 * GET /api/products
 */
app.get('/api/products', asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM products ORDER BY id');
  res.json(result.rows);
}));

/**
 * 獲取單個商品
 * GET /api/products/:id
 */
app.get('/api/products/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // 驗證 ID 是否為數字
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Product ID must be a number' });
  }
  
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(result.rows[0]);
}));

/**
 * 獲取設置
 * GET /api/settings
 */
app.get('/api/settings', asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM app_settings WHERE id=$1', ['main']);
  if (result.rows.length === 0) {
    return res.json({
      id: 'main',
      shipping_fee: 15,
      free_shipping_threshold: 200,
      whatsapp_number: ''
    });
  }
  res.json(result.rows[0]);
}));

// ===== 受保護的 API（需要身份驗證） =====

/**
 * 建立商品
 * POST /api/products
 */
app.post('/api/products', authenticateToken, validateRequest(productSchema), asyncHandler(async (req, res) => {
  const { name, price, stock, discount, image, description } = req.validatedBody;
  
  const result = await pool.query(
    'INSERT INTO products (name, price, stock, discount, image, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [name, price, stock, discount, image, description]
  );
  res.status(201).json(result.rows[0]);
}));

/**
 * 更新商品
 * PUT /api/products/:id
 */
app.put('/api/products/:id', authenticateToken, validateRequest(productSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, price, stock, discount, image, description } = req.validatedBody;
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Product ID must be a number' });
  }
  
  const result = await pool.query(
    'UPDATE products SET name=$1, price=$2, stock=$3, discount=$4, image=$5, description=$6, updated_at=now() WHERE id=$7 RETURNING *',
    [name, price, stock, discount, image, description, id]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(result.rows[0]);
}));

/**
 * 刪除商品
 * DELETE /api/products/:id
 */
app.delete('/api/products/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Product ID must be a number' });
  }
  
  const result = await pool.query('DELETE FROM products WHERE id=$1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ success: true, id: result.rows[0].id });
}));

/**
 * 更新設置
 * POST /api/settings
 */
app.post('/api/settings', authenticateToken, validateRequest(settingsSchema), asyncHandler(async (req, res) => {
  const { shipping_fee, free_shipping_threshold, whatsapp_number } = req.validatedBody;
  
  const result = await pool.query(
    'INSERT INTO app_settings (id, shipping_fee, free_shipping_threshold, whatsapp_number) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET shipping_fee=$2, free_shipping_threshold=$3, whatsapp_number=$4, updated_at=now() RETURNING *',
    ['main', shipping_fee, free_shipping_threshold, whatsapp_number]
  );
  res.json(result.rows[0]);
}));

// ===== 錯誤處理 =====

// 404 處理
app.use(notFoundHandler);

// 全局錯誤處理
app.use(errorHandler);

// ===== 啟動服務器 =====
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(`🔒 Authentication required for: POST/PUT/DELETE /api/products, POST /api/settings`);
});

// ===== 優雅關閉 =====
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing connections...');
  pool.end(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});

