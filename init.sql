-- 初始化 PostgreSQL 數據庫

-- 商品表
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  discount DECIMAL(5, 2) DEFAULT 0,
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入默認設置
INSERT INTO app_settings (id, shipping_fee, free_shipping_threshold, whatsapp_number)
VALUES ('main', 15, 200, '')
ON CONFLICT (id) DO NOTHING;

-- 插入示例商品
INSERT INTO products (name, price, stock, discount, image, description)
VALUES 
  ('貓糧 - 雞肉味', 89.99, 50, 0, '', '高蛋白貓糧'),
  ('狗糧 - 牛肉味', 129.99, 30, 10, '', '成犬專用狗糧'),
  ('貓零食 - 雞肉棒', 29.99, 100, 0, '', '低脂肪貓零食')
ON CONFLICT DO NOTHING;

-- 創建索引以提高查詢性能
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_app_settings_id ON app_settings(id);
