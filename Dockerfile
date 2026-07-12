FROM node:18.20.2-alpine

WORKDIR /app

# 复制 package.json 和 package-lock.json（或 yarn.lock）
COPY package*.json ./

# 安装所有依赖（包括 devDependencies）
RUN npm install

# 复制源代码
COPY src ./src

# 暴露 Render 要求的主端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 启动服务
CMD ["node", "src/sequentialthinking/index.js"]
