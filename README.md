# 🐾 PetFood Mart

Vue 3 + Supabase 的寵物食品線上商店，支援商品管理、購物車、WhatsApp 下單與 PDF 收據。

## ✨ 功能
- 商品瀏覽 / 搜尋
- 購物車與金額計算
- 配送方式：自取（3% 折扣）/ 標準配送 / 自訂配送
- WhatsApp 一鍵下單
- PDF 訂單下載
- 後台：商品 CRUD、運費與門檻設定
- 中英文切換

## 🛠️ 技術棧

### 前端框架
| 技術 | 說明 |
|------|------|
| **Vue 3 (CDN)** | 漸進式 JavaScript 框架，提供響應式數據綁定和組件化開發 |
| **Tailwind CSS** | 實用優先的 CSS 框架，快速構建現代化 UI |
| **FontAwesome 6** | 圖標庫，提供 2000+ 精美圖標 |

### 後端服務
| 技術 | 說明 |
|------|------|
| **Supabase** | 開源 Firebase 替代品，基於 PostgreSQL |
| **PostgreSQL** | 強大的關係型數據庫 |
| **Realtime** | WebSocket 實時訂閱，數據變化即時通知 |

### 工具庫
| 技術 | 說明 |
|------|------|
| **jsPDF** | PDF 文檔生成庫 |
| **AutoTable** | jsPDF 表格插件 |

## 📁 專案結構

```
my-pet-shop/
├── index.html                    # 主入口 (單頁應用)
├── package.json                  # 項目配置
├── README.md                     # 文檔
│
└── js/
    ├── config.js                 # Supabase 配置
    │
    ├── composables/              # Vue 3 Composables (業務邏輯)
    │   ├── useTranslation.js     # 多語言翻譯
    │   ├── useToast.js           # 通知提示
    │   ├── useCart.js            # 購物車邏輯
    │   ├── useProducts.js        # 商品管理
    │   ├── useAdmin.js           # 管理員認證
    │   └── useOrder.js           # 訂單生成
    │
    ├── services/                 # 服務層 (API 調用)
    │   ├── supabaseService.js    # 數據庫操作
    │   └── pdfService.js         # PDF 生成
    │
    └── utils/                    # 工具層
        ├── constants.js          # 常量定義
        └── helpers.js            # 工具函數
```

## 🏗️ 架構說明

### 數據流向
```
使用者操作 (UI)
    ↓
Vue 3 事件處理
    ↓
Composables (業務邏輯)
    ↓
Services (API 調用)
    ↓
Supabase (數據庫)
    ↓
實時推送 (Realtime)
    ↓
UI 自動更新
```

### 模塊化設計

**Composables (業務邏輯層)**
- `useCart`: 購物車計算邏輯（小計、折扣、運費、合計）
- `useProducts`: 商品加載、搜尋、新增、編輯、刪除
- `useAdmin`: 管理員登入認證、設置管理
- `useOrder`: 訂單文字生成（WhatsApp、PDF）
- `useTranslation`: 多語言翻譯（中/英）
- `useToast`: 通知提示系統

**Services (API 調用層)**
- `supabaseService`: 封裝所有數據庫操作（CRUD、Realtime）
- `pdfService`: PDF 收據生成

**Utils (工具層)**
- `constants`: 應用常量（配置、常數值）
- `helpers`: 通用工具函數（格式化、驗證、計算）

## 🚀 快速開始

### 方式 A: Docker (推薦) 🐳

**前置要求**
- 已安裝 Docker 和 Docker Compose

**啟動步驟**
```bash
# 1. 在項目根目錄執行
docker-compose up -d

# 2. 等待服務啟動（約 30 秒）
docker-compose logs -f

# 3. 訪問應用
# 前端：http://localhost:3000
# 後端 API：http://localhost:3001
# 數據庫：localhost:5432 (PostgreSQL)

# 4. 停止服務
docker-compose down
```

**docker-compose 包含**
- 🎨 Frontend (Vue 3)：端口 3000
- 🔧 Backend (Express)：端口 3001
- 🗄️ PostgreSQL 數據庫：端口 5432

### 方式 B: 本地開發環境

#### 1) 設定 Supabase 或本地 API

**選項 A: 使用本地 API**
```bash
# 安裝後端依賴
cd backend
npm install
cd ..

# 在 js/config.js 中設置
API_MODE = 'local'  # 已預設為 local
```

**選項 B: 使用 Supabase**
編輯 `js/config.js`：
```js
API_MODE = 'supabase'

export const SUPABASE_CONFIG = {
  url: "YOUR_SUPABASE_URL",
  anonKey: "YOUR_SUPABASE_ANON_KEY"
};
```

#### 2) 建立本地 PostgreSQL 資料表（本地 API 模式）

在本地 PostgreSQL 中執行 `init.sql`：

```bash
# 使用 psql 客戶端
psql -U postgres -d petfood -f init.sql

# 或在 pgAdmin 中執行 init.sql 的 SQL 語句
```

#### 3) 啟動本地後端服務器（本地 API 模式）

```bash
cd backend
npm install
npm start

# 服務器將在 http://localhost:3001 運行
```

#### 4) 啟動前端應用
```bash
npm start
```
開啟 `http://localhost:3000`

### 常用 Docker 命令

```bash
# 查看運行的容器
docker-compose ps

# 查看日誌
docker-compose logs -f backend
docker-compose logs -f db

# 重啟服務
docker-compose restart

# 清理所有容器和數據
docker-compose down -v

# 進入容器終端
docker-compose exec backend sh
docker-compose exec db psql -U postgres -d petfood
```

### 環境變數配置

**前端環境** (已預設)
```
API_MODE=local
LOCAL_API_BASE_URL=http://localhost:3001
```

**後端環境** (`backend/.env`)
```
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432
DB_NAME=petfood
PORT=3001
NODE_ENV=development
```

## 🔐 預設後台
- **帳號**: admin
- **密碼**: admin

⚠️ **上線前請改密碼**

## 📝 使用指南

### 客戶端
1. 瀏覽商品 → 搜尋或直接加入購物車
2. 選擇配送方式（自取享 3% 折扣）
3. WhatsApp 下單 或 下載 PDF 收據

### 後台
1. 登入後進入商品管理或設置
2. 商品管理：新增、編輯、刪除商品
3. 設置：調整運費、免運門檻、WhatsApp 號碼

## 🚀 未來優化方向

### 功能擴展
- [ ] **用戶系統** - 用戶註冊、登入、訂單歷史
- [ ] **支付集成** - Stripe、PayPal、本地支付方案
- [ ] **優惠券** - 優惠碼、折扣券、會員卡
- [ ] **庫存預警** - 低庫存提醒、自動補貨通知
- [ ] **評論系統** - 商品評分、用戶評論

### 商業功能
- [ ] **訂單管理** - 訂單查詢、配送追蹤、退貨管理
- [ ] **郵件通知** - 訂單確認、配送狀態、新品上架
- [ ] **分析儀表板** - 銷售統計、客戶行為分析
- [ ] **社交分享** - Facebook、WhatsApp、微信分享
- [ ] **推薦系統** - 個性化商品推薦

### 技術優化
- [ ] **移動應用** - React Native / Flutter 跨平台 App
- [ ] **Vite 構建** - 從 CDN 升級到現代化構建工具
- [ ] **TypeScript** - 添加類型檢查提升代碼質量
- [ ] **單元測試** - Jest / Vitest 測試覆蓋
- [ ] **SEO 優化** - Next.js / Nuxt.js 靜態生成
- [ ] **PWA** - 離線支持、安裝到主屏幕
- [ ] **國際化** - 支持更多語言、貨幣、地區

### 性能優化
- [ ] **圖片優化** - WebP 格式、圖片壓縮、CDN 分發
- [ ] **代碼分割** - 動態導入、路由懶加載
- [ ] **緩存策略** - Service Worker、瀏覽器緩存
- [ ] **數據庫優化** - 索引優化、查詢性能監測

## ⚠️ 重要提醒
- 不要在公開倉庫提交真實 API Key
- 生產環境啟用 Supabase RLS
- 建議使用更安全的登入方式（Supabase Auth）

---
**版本**: 1.0.0 | **更新**: 2026年4月17日