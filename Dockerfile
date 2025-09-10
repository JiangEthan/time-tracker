FROM node:18-alpine

# 安装必要的构建依赖
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装所有依赖（包括devDependencies）
RUN npm ci

# 复制应用代码
COPY . .

# 创建数据库目录
RUN mkdir -p database

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 更改所有者
RUN chown -R nodejs:nodejs /app
USER nodejs

# 暴露端口
EXPOSE 3000

# 初始化数据库
RUN npm run init-db

# 启动应用
CMD ["npm", "start"]