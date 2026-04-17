# 🐾 PetFood Mart - 寵物食品線上商店

一個功能完整的寵物食品電商平台，支持多語言（中文/英文）、實時庫存管理、WhatsApp 訂單、PDF 收據生成等功能。

## ✨ 核心功能

### 🛍️ 客戶端功能
- **商品瀏覽** - 實時查看所有商品及庫存
- **搜索功能** - 按商品名稱或描述快速查找
- **購物車管理** - 添加/移除商品，調整數量
- **三種配送方式**
  - 🏪 **到店自取** - 優惠 3% 折扣
  - 🚚 **標準配送** - 滿 RM 200 免運費
  - 📦 **自定義配送** - 自付運費
- **WhatsApp 訂單** - 一鍵發送訂單詳情到 WhatsApp
- **PDF 收據** - 下載完整的訂單收據
- **多語言支持** - 中文/英文切換

### 👨‍💼 後台管理功能
- **商品管理**
  - ➕ 新增商品（名稱、價格、庫存、折扣、圖片、描述）
  - ✏️ 編輯商品詳情
  - 🗑️ 刪除商品
  - 📸 支持圖片上傳或 URL 導入
  
- **設置管理**
  - 🚚 配置標準運費
  - 🎁 設置免運門檻
  - 📱 配置店家 WhatsApp 號碼

## 🏗️ 項目結構

```
my-pet-shop/
├── index.html                          # 主入口文件
├── package.json                        # 項目配置
├── README.md                           # 本文件
│
├── js/
│   ├── config.js                      # ⚙️ Supabase 配置
│   │
│   ├── composables/                   # 🔧 業務邏輯層（Vue Composables）
│   │   ├── useTranslation.js         # 多語言翻譯功能
│   │   ├── useToast.js               # 通知提示系統
│   │   ├── useCart.js                # 購物車邏輯
│   │   ├── useProducts.js            # 商品管理邏輯
│   │   ├── useAdmin.js               # 管理員認證邏輯
│   │   └── useOrder.js               # 訂單生成邏輯
│   │
│   ├── services/                      # 🌐 API 調用層
│   │   ├── supabaseService.js        # Supabase 數據庫操作
│   │   └── pdfService.js             # PDF 生成服務
│   │
│   └── utils/                         # 🛠️ 工具函數
│       ├── constants.js              # 常量定義
│       └── helpers.js                # 通用工具函數
```

## 🔧 技術棧

### 前端框架
- **Vue 3** - 漸進式 JavaScript 框架
- **Tailwind CSS** - 原子化 CSS 框架
- **FontAwesome 6** - 圖標庫

### 後端服務
- **Supabase** - 開源 Firebase 替代品
  - 實時數據庫（PostgreSQL）
  - 實時訂閱（Websocket）
  - 無服務器函數

### 工具庫
- **jsPDF** + **html2pdf** - PDF 生成
- **Font Awesome** - UI 圖標

## 📦 安裝與運行

### 1. 環境要求
- 現代瀏覽器（Chrome、Firefox、Safari、Edge）
- Node.js 14+ （可選，用於本地開發服務器）

### 2. 項目設置

```bash
# 克隆項目（如使用 Git）
git clone https://github.com/sam0418/my-pet-shop.git
cd my-pet-shop

# 安裝依賴（可選）
npm install
```

### 3. 配置 Supabase

編輯 `js/config.js`，填入你的 Supabase 配置：

```javascript
export const SUPABASE_CONFIG = {
  url: "YOUR_SUPABASE_PROJECT_URL",
  anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

**獲取方式：**
1. 訪問 [Supabase 官網](https://supabase.com)
2. 創建新項目
3. 進入 Settings → API
4. 複製 Project URL 和 Anon Key

### 4. 設置數據庫表

在 Supabase 控制台執行以下 SQL：

```sql
-- 商品表
CREATE TABLE products (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  discount DECIMAL(5, 2) DEFAULT 0,
  image TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 應用設置表
CREATE TABLE app_settings (
  id TEXT PRIMARY KEY,
  shipping_fee DECIMAL(10, 2) DEFAULT 15,
  free_shipping_threshold DECIMAL(10, 2) DEFAULT 200,
  whatsapp_number TEXT,
  updated_at TIMESTAMP DEFAULT now()
);

-- 初始化設置
INSERT INTO app_settings (id, shipping_fee, free_shipping_threshold)
VALUES ('main', 15, 200);
```

### 5. 運行項目

**方式一：直接打開文件**
```bash
# 在 Windows 中，直接雙擊 index.html 即可打開
```

**方式二：使用本地服務器（推薦）**
```bash
# 使用內建的服務器
npm start

# 或使用 Python
python -m http.server 8000

# 或使用 PHP
php -S localhost:8000
```

訪問 `http://localhost:8000`

## 📖 使用指南

### 客戶端操作

#### 1. 瀏覽商品
- 進入首頁查看所有商品
- 使用搜索框查找特定商品
- 查看商品折扣、庫存等信息

#### 2. 購物結算
1. 點擊「加入購物車」添加商品
2. 進入購物車頁面
3. 選擇配送方式：
   - **到店自取**：自動應用 3% 折扣
   - **標準配送**：滿 RM 200 免運費
   - **自定義配送**：填寫收件信息，自付運費
4. 選擇支付方式：
   - **WhatsApp 下單**：發送訂單詳情到店家 WhatsApp
   - **下載 PDF**：保存完整收據

#### 3. 語言切換
- 點擊導航欄的「EN」/「中文」按鈕切換語言

### 後台管理

#### 1. 登錄
- 點擊導航欄的 👤 圖標
- 默認賬號：`admin` / `admin`
- ⚠️ **生產環境請更改密碼**

#### 2. 商品管理
- **新增商品**
  1. 進入「商品」標籤
  2. 填寫商品信息（名稱、價格、庫存必填）
  3. 上傳或粘貼圖片 URL
  4. 點擊「新增」保存

- **編輯商品**
  1. 在商品列表點擊編輯按鈕（✏️）
  2. 修改信息後點擊「更新」

- **刪除商品**
  1. 在商品列表點擊刪除按鈕（🗑️）
  2. 確認刪除

#### 3. 設置管理
- 進入「設置」標籤
- 修改：
  - 標準運費（RM）
  - 免運門檻（RM）
  - 店家 WhatsApp 號碼（格式：60123456789）
- 點擊「保存設置」

## 🔐 安全注意事項

### ⚠️ 重要提醒

1. **API Key 管理**
   - 不要在公開倉庫提交真實的 Supabase Key
   - 使用環境變量管理敏感信息
   - 生產環境應使用 Row Level Security (RLS)

2. **管理員認證**
   - 當前使用硬編碼密碼（不安全）
   - 生產環境應使用：
     - Supabase Auth
     - JWT Token
     - 更複雜的密碼

3. **數據庫安全**
   - 啟用 Supabase RLS
   - 限制 API 訪問權限
   - 定期備份數據

## 📱 功能詳解

### 購物車計算邏輯

```javascript
小計 = Σ(商品價格 × 數量)
折扣 = 配送方式 === 'pickup' ? 小計 × 3% : 0
運費 = {
  'pickup': 0,
  'delivery': 小計 >= 200 ? 0 : 15,
  'custom': 15
}
合計 = 小計 - 折扣 + 運費
```

### WhatsApp 訂單格式

```
🐾 新訂單 - PetFood Mart

📦 商品清單：
  • 商品 A ×2 @ RM 25.00 = RM 50.00
  • 商品 B ×1 @ RM 30.00 = RM 30.00

小計：RM 80.00
配送方式：到店自取（-3%）
優惠折扣：-RM 2.40

💰 合計：RM 77.60
```

### PDF 收據內容

- 訂單號和日期
- 配送信息（如適用）
- 完整的商品列表和價格
- 費用明細
- 感謝信息

## 🔄 實時功能

本應用使用 Supabase 實時訂閱，實現以下功能：

1. **商品實時更新** - 修改商品時自動刷新列表
2. **設置實時同步** - 管理員修改設置即時生效
3. **庫存實時更新** - 跨設備庫存同步

## 🎨 UI/UX 特點

- **響應式設計** - 完美適配所有設備尺寸
- **現代化界面** - 使用 Tailwind CSS 打造
- **流暢動畫** - Vue 3 transition 效果
- **無障礙設計** - 符合 WCAG 標準
- **深色模式友好** - 適配系統主題

## 📊 性能優化

- ✅ 模塊化代碼 - 易於分割和懶加載
- ✅ Computed 屬性 - 自動緩存計算結果
- ✅ 事件委托 - 減少 DOM 監聽器數量
- ✅ 圖片懶加載 - 改善首屏加載速度
- ✅ CDN 資源 - 使用全球 CDN 加速

## 🐛 常見問題

### Q: 商品無法加載？
**A:** 檢查以下項目：
1. Supabase API Key 是否正確
2. 數據庫表是否創建
3. 瀏覽器控制台是否有錯誤信息

### Q: WhatsApp 訂單無法發送？
**A:** 確保：
1. 已在設置中配置 WhatsApp 號碼
2. 號碼格式正確（例：60123456789）
3. 瀏覽器允許打開新窗口

### Q: PDF 下載有亂碼？
**A:**
1. 確保已加載 jsPDF 庫
2. 嘗試更新瀏覽器
3. 檢查控制台是否有錯誤

## 📝 後續開發計劃

- [ ] 用戶賬戶系統
- [ ] 訂單歷史記錄
- [ ] 支付集成（Stripe、PayPal）
- [ ] 庫存預警系統
- [ ] 郵件通知功能
- [ ] 分析儀表板
- [ ] 優惠券/優惠碼
- [ ] 社交分享功能
---

**最後更新**: 2026年4月17日
**版本**: 1.0.0