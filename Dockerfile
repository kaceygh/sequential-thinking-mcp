# 使用 Node.js 18-alpine（Render 默认支持）
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（确保 lockfile 存在）
COPY package*.json ./

# 安装依赖（强制使用 npm install 并忽略错误）
RUN npm install --omit=dev || true

# 复制源代码
COPY src ./src

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npx", "supergateway", "--stdio", "node src/sequentialthinking/index.js", "--port", "3000", "--ssePath", "/sse", "--healthPath", "/health"]
