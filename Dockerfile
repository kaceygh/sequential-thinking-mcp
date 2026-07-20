FROM node:20-alpine

WORKDIR /app
COPY package*.json ./

# 安装依赖
RUN npm install --omit=dev

COPY src ./src

# 暴露主服务端口和健康检查端口
EXPOSE 3000 10000

ENV NODE_ENV=production
ENV PORT=3000

# 启动服务
CMD ["node", "src/sequentialthinking/index.js"]
