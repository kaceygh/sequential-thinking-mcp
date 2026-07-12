FROM node:18-alpine

# 安装系统依赖
RUN apk add --no-cache curl

WORKDIR /app
COPY package*.json ./

# 安装依赖（使用国内镜像源 + 跳过可选依赖）
RUN npm config set registry https://registry.npmmirror.com && \
    npm install --production --no-optional --verbose

COPY src ./src

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 启动命令（添加--exit-after-start测试模式）
CMD ["npx", "supergateway", "--stdio", "node src/sequentialthinking/index.js", \
     "--port", "3000", \
     "--ssePath", "/sse", \
     "--healthPath", "/health", \
     "--exit-after-start"]  # 仅测试用，部署成功后移除
