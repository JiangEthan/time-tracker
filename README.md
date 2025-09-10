# 工时管理系统

一个轻量级的个人工时管理系统，用于记录上下班时间、计算工时和加班时间，支持数据统计和查询。

## 功能特点

- 📝 打卡记录管理：添加、编辑、删除打卡记录
- ⏱️ 自动工时计算：扣除1小时午休，计算加班时间
- 📊 数据统计：每日、每周、每月工时统计
- 📱 响应式设计：完美适配PC和手机浏览器
- 🚀 轻量级：SQLite数据库，资源占用少
- 🔧 易部署：Docker容器化，一键部署

## 技术栈

- 后端：Node.js + Express
- 数据库：SQLite
- 前端：HTML + CSS + JavaScript（原生）
- 容器化：Docker + Docker Compose

## 工时计算规则

- 标准工时：10小时（朝9晚8，扣除1小时午休）
- 实际工时：下班时间 - 上班时间 - 1小时午休
- 加班时间：实际工时 - 标准工时

## 快速开始

### 本地开发

1. 克隆项目
```bash
git clone https://github.com/yourusername/time-tracker.git
cd time-tracker
```

2. 安装依赖
```bash
npm install
```

3. 初始化数据库
```bash
npm run init-db
```

4. 启动应用
```bash
npm start
```

5. 访问应用
打开浏览器访问 http://localhost:3000

### Docker部署

1. 构建并启动容器
```bash
docker compose up --build -d
```

2. 访问应用
打开浏览器访问 http://localhost:3000

## API文档

### 打卡记录管理

- `GET /api/records` - 获取所有打卡记录
- `POST /api/records` - 创建新的打卡记录
- `PUT /api/records/:id` - 更新打卡记录
- `DELETE /api/records/:id` - 删除打卡记录

### 统计接口

- `GET /api/stats/daily?date=YYYY-MM-DD` - 获取每日统计
- `GET /api/stats/weekly?date=YYYY-MM-DD` - 获取每周统计
- `GET /api/stats/monthly?date=YYYY-MM-DD` - 获取每月统计
- `GET /api/stats/range?start=YYYY-MM-DD&end=YYYY-MM-DD` - 获取日期范围统计

### 健康检查

- `GET /health` - 服务健康状态

## 项目结构

```
time-tracker/
├── src/                    # 源代码
│   ├── app.js             # Express应用入口
│   ├── config/            # 配置文件
│   ├── controllers/       # 控制器
│   ├── models/           # 数据模型
│   ├── routes/           # 路由
│   ├── scripts/          # 脚本
│   └── utils/            # 工具函数
├── public/               # 静态资源
│   ├── index.html        # 主页面
│   ├── css/              # 样式文件
│   └── js/               # JavaScript文件
├── database/             # 数据库文件
├── docker-compose.yml    # Docker Compose配置
├── Dockerfile           # Docker镜像配置
└── package.json         # 项目依赖
```

## 部署到云服务器

1. 确保服务器已安装Docker和Docker Compose

2. 克隆项目到服务器
```bash
git clone https://github.com/yourusername/time-tracker.git
cd time-tracker
```

3. 启动服务
```bash
docker compose up -d
```

4. （可选）配置反向代理（Nginx）

## 开发说明

### 添加新功能

1. 后端：在`src/controllers/`添加控制器逻辑
2. 路由：在`src/routes/`添加API路由
3. 前端：在`public/js/`添加JavaScript逻辑

### 数据库迁移

如需修改数据库结构，请：
1. 更新`src/scripts/init-database.js`
2. 运行`npm run init-db`重新初始化（注意备份数据）

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License

---

💡 提示：这是一个为个人使用设计的轻量级系统，如需多用户支持，请参考`DESIGN.md`中的扩展方案。