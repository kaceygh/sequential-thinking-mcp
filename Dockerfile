# 使用 Node.js 18-alpine
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖（强制忽略 devDependencies）
RUN npm install --production

# 复制源代码
COPY src ./src

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# ✅ 明确暴露端口（Render 需要检测）
EXPOSE 3000

# 启动命令（确保监听 $PORT）
CMD ["npx", "supergateway", "--stdio", "node src/sequentialthinking/index.js", "--port", "3000", "--ssePath", "/sse", "--healthPath", "/health"]
