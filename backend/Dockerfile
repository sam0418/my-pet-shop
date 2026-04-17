# 後端 Dockerfile - 多階段優化版本
# 階段1: 依賴安裝
FROM node:18-alpine AS dependencies

WORKDIR /app

# 複製 package 文件
COPY package*.json ./

# 安裝所有依賴（包括開發）
RUN npm ci

# 階段2: 生產構建
FROM node:18-alpine AS builder

WORKDIR /app

# 只複製生產依賴
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# 階段3: 最終運行映像
FROM node:18-alpine

WORKDIR /app

# 安裝dumb-init以正確處理信號
RUN apk add --no-cache dumb-init

# 設置NODE_ENV為生產
ENV NODE_ENV=production

# 複製生產依賴
COPY --from=builder /app/node_modules ./node_modules

# 複製應用代碼（只複製必要檔案）
COPY package*.json ./
COPY server.js ./
COPY middleware/ ./middleware/
COPY db/ ./db/

# 建立非root用戶（安全性）
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# 暴露端口
EXPOSE 3001

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# 使用 dumb-init 啟動應用（正確處理信號）
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
