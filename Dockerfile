# 前端 Dockerfile
FROM node:18-alpine

WORKDIR /app

# 安裝依賴
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps || npm install

# 複製應用代碼
COPY . .

# 暴露端口
EXPOSE 3000

# 啟動開發服務器
CMD ["npm", "start"]
