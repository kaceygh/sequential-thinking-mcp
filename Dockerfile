# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src

# 运行阶段（更小镜像）
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# supergateway: stdio → SSE (端口 3000, 路径 /sse, 健康检查 /health)
CMD ["npx", "supergateway", "--stdio", "node src/sequentialthinking/index.js", "--port", "3000", "--ssePath", "/sse", "--healthPath", "/health"]