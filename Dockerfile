# 阶段 1：构建
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev  # <-- 容错处理：如果 ci 失败则退化为 install
COPY src ./src

# 阶段 2：运行
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["npx", "supergateway", "--stdio", "node src/sequentialthinking/index.js", "--port", "3000", "--ssePath", "/sse", "--healthPath", "/health"]
