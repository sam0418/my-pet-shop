-- 寵物食品線上商店 - 資料庫初始化腳本
-- 建立表和索引，提升查詢性能

-- 商品表
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  discount DECIMAL(5, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
  image TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 應用設置表
CREATE TABLE IF NOT EXISTS app_settings (
  id VARCHAR(50) PRIMARY KEY,
  shipping_fee DECIMAL(10, 2) DEFAULT 15,
  free_shipping_threshold DECIMAL(10, 2) DEFAULT 200,
  whatsapp_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 訂單表（新增，用於訂單歷史）
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  total_amount DECIMAL(10, 2) NOT NULL,
  items JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== 效能索引 =====

-- 產品表索引
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- 應用設置表索引
CREATE INDEX IF NOT EXISTS idx_settings_id ON app_settings(id);

-- 訂單表索引
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ===== 初始數據 =====

-- 插入預設設置（如果不存在）
INSERT INTO app_settings (id, shipping_fee, free_shipping_threshold, whatsapp_number)
VALUES ('main', 15, 200, '')
ON CONFLICT (id) DO NOTHING;

-- 插入示範商品（如果不存在）
INSERT INTO products (name, price, stock, discount, image, description)
VALUES 
  ('狗糧 - 雞肉風味', 299.99, 50, 0, 'https://via.placeholder.com/300x300?text=Dog+Food', '高蛋白狗糧，採用天然雞肉製造'),
  ('貓糧 - 魚肉風味', 199.99, 80, 10, 'https://via.placeholder.com/300x300?text=Cat+Food', '貓咪喜愛的魚肉配方'),
  ('寵物玩具 - 毛球', 49.99, 120, 15, 'https://via.placeholder.com/300x300?text=Toy', '貓咪最愛的互動玩具'),
  ('寵物碗 - 不鏽鋼', 89.99, 40, 0, 'https://via.placeholder.com/300x300?text=Bowl', '耐用不鏽鋼寵物碗')
ON CONFLICT (name) DO NOTHING;

-- 為新增的索引優化設置（針對PostgreSQL）
-- 啟用自動VACUUM和ANALYZE以維持索引性能
ALTER TABLE products SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE orders SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE app_settings SET (autovacuum_vacuum_scale_factor = 0.1);

-- ===== 統計信息更新 =====
-- 強制更新統計信息以幫助查詢優化器
ANALYZE products;
ANALYZE orders;
ANALYZE app_settings;
