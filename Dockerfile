# 使用 Node.js 18-alpine
FROM node:18-alpine

# 安装系统依赖（确保网络工具和 Git 可用）
RUN apk add --no-cache \
    git \
    curl \
    ca-certificates \
    python3 \
    make \
    g++

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 设置 npm 超时和重试机制（使用国内镜像源）
RUN npm config set registry https://registry.npmmirror.com && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --production --verbose

# 复制源码
COPY src ./src

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npx", "supergateway", "--stdio", "node src/sequentialthinking/index.js", "--port", "3000", "--ssePath", "/sse", "--healthPath", "/health"]
