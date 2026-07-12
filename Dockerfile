# 阶段 1：构建
FROM node:18-alpine AS builder

# 安装系统依赖（确保网络和 git 可用）
RUN apk add --no-cache \
    git \
    curl \
    ca-certificates

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 设置 npm 超时和重试机制
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --production --verbose  # ✅ 添加 --verbose 查看详细日志

# 复制源码
COPY src ./src

# 阶段 2：运行
FROM node:18-alpine
WORKDIR /app

# 复制构建产物
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# 启动命令
CMD ["npx", "supergateway", "--stdio", "node src/sequentialthinking/index.js", "--port", "3000", "--ssePath", "/sse", "--healthPath", "/health"]
