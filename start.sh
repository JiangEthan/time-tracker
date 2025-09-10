#!/bin/bash

# 工时管理系统启动脚本

echo "正在启动工时管理系统..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 请先安装 Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "错误: 请先安装 npm"
    exit 1
fi

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
fi

# 创建数据库目录
mkdir -p database

# 初始化数据库
echo "正在初始化数据库..."
npm run init-db

# 启动应用
echo "正在启动应用..."
echo "访问地址: http://localhost:3000"
npm start