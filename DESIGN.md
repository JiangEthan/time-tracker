# 工时管理系统设计文档

## 1. 项目概述

### 1.1 项目目标
开发一个轻量级的个人工时管理系统，用于记录上下班时间、计算工时和加班时间，支持数据统计和查询。系统设计充分考虑后续扩展性，可平滑升级为多用户系统。

### 1.2 技术栈
- 后端：Node.js + Express
- 数据库：SQLite
- 前端：HTML + CSS + JavaScript（原生）
- 容器化：Docker + Docker Compose
- 部署环境：2核2G服务器

### 1.3 运行环境
- 开发环境：Ubuntu 20.04 + Docker 28.1.1
- 生产环境：云服务器（2核2G 3M带宽）
- 支持平台：PC浏览器、手机浏览器（响应式设计）

## 2. 系统架构

### 2.1 整体架构
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   前端界面   │────▶│   Express   │────▶│   SQLite    │
│ (HTML/CSS/JS)│     │    API      │     │   数据库    │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 2.2 项目结构
```
time-tracker/
├── docker-compose.yml    # Docker Compose配置
├── Dockerfile            # 应用镜像构建
├── .dockerignore         # Docker构建忽略
├── .gitignore           # Git忽略文件
├── package.json         # 项目依赖
├── README.md            # 项目说明
├── DESIGN.md            # 设计文档
├── src/                 # 源代码
│   ├── app.js           # Express应用入口
│   ├── config/          # 配置文件
│   │   └── database.js  # 数据库配置
│   ├── middleware/      # 中间件
│   │   ├── auth.js      # 认证中间件
│   │   └── cors.js      # CORS中间件
│   ├── routes/          # 路由
│   │   ├── api.js       # API路由
│   │   └── auth.js      # 认证路由
│   ├── models/          # 数据模型
│   │   ├── User.js      # 用户模型
│   │   └── TimeRecord.js # 打卡记录模型
│   ├── controllers/     # 控制器
│   │   ├── authController.js
│   │   └── recordController.js
│   └── utils/           # 工具函数
│       ├── timeCalc.js  # 工时计算
│       └── validation.js # 数据验证
├── public/              # 静态资源
│   ├── index.html       # 主页面
│   ├── css/
│   │   ├── style.css    # 主样式
│   │   └── mobile.css   # 移动端样式
│   └── js/
│       ├── app.js       # 前端主逻辑
│       ├── api.js       # API调用
│       └── utils.js     # 工具函数
├── tests/               # 测试文件
└── database/            # 数据库文件
    └── time_tracker.db  # SQLite数据库
```

## 3. 功能设计

### 3.1 核心功能

#### 3.1.1 打卡记录管理
- **添加记录**：输入日期、上班时间、下班时间
- **查看记录**：显示所有打卡记录列表
- **修改记录**：编辑已有的打卡记录
- **删除记录**：删除错误的打卡记录

#### 3.1.2 工时计算
- **标准工时**：10小时（朝9晚8，扣除1小时午休）
- **实际工时**：下班时间 - 上班时间 - 1小时午休
- **加班时间**：实际工时 - 标准工时

#### 3.1.3 数据统计
- **每日统计**：显示单日工时详情
- **每周汇总**：显示本周总工时、加班时间、工作天数
- **每月汇总**：显示本月总工时、加班时间、工作天数

### 3.2 业务规则
1. 工作时间计算时自动扣除1小时午休时间
2. 标准工作时长为10小时（11小时-1小时午休）
3. 超过标准工时的部分算作加班
4. 周末和节假日与工作日计算规则相同
5. 时间格式使用24小时制（HH:MM）

## 4. 数据库设计

### 4.1 用户表 (users) - 为多用户扩展预留
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE,
    full_name TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 打卡记录表 (time_records)
```sql
CREATE TABLE time_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,            -- 用户ID，为多用户预留
    date TEXT NOT NULL,          -- 日期 (YYYY-MM-DD)
    check_in_time TEXT NOT NULL, -- 上班时间 (HH:MM)
    check_out_time TEXT NOT NULL,-- 下班时间 (HH:MM)
    work_hours REAL,            -- 实际工时
    overtime_hours REAL,        -- 加班时间
    note TEXT,                  -- 备注
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 4.3 系统配置表 (system_config) - 存储用户相关配置
```sql
CREATE TABLE system_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,            -- 用户ID，NULL表示全局配置
    config_key TEXT NOT NULL,
    config_value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.4 索引设计
```sql
CREATE INDEX idx_date ON time_records(date);
CREATE INDEX idx_user_date ON time_records(user_id, date);
CREATE INDEX idx_username ON users(username);
```

## 5. API设计

### 5.1 RESTful API接口

#### 5.1.1 用户管理（为多用户扩展预留）
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息
- `POST /api/auth/logout` - 用户登出

#### 5.1.2 打卡记录管理
- `GET /api/records` - 获取所有打卡记录
- `GET /api/records?page=1&limit=10` - 分页获取打卡记录
- `POST /api/records` - 创建新的打卡记录
- `PUT /api/records/:id` - 更新打卡记录
- `DELETE /api/records/:id` - 删除打卡记录

#### 5.1.3 统计接口
- `GET /api/stats/daily?date=YYYY-MM-DD` - 获取每日统计
- `GET /api/stats/weekly?date=YYYY-MM-DD` - 获取每周统计
- `GET /api/stats/monthly?date=YYYY-MM-DD` - 获取每月统计
- `GET /api/stats/range?start=YYYY-MM-DD&end=YYYY-MM-DD` - 获取日期范围统计

#### 5.1.4 系统配置接口
- `GET /api/config` - 获取系统配置
- `PUT /api/config` - 更新系统配置

### 5.2 响应格式
```json
{
    "success": true,
    "data": {},
    "message": "操作成功"
}
```

### 5.3 认证机制（多用户扩展）
- 使用JWT（JSON Web Token）进行用户认证
- Token有效期：24小时
- 支持Token刷新机制
- API请求头携带Token：`Authorization: Bearer <token>`

## 6. 界面设计

### 6.1 设计原则
- 极简风格
- 响应式设计（完美适配PC和手机浏览器）
- 移动优先设计
- 快速加载
- 易于操作
- 触摸友好（移动端）

### 6.2 页面布局

#### PC端布局
```
┌─────────────────────────────────────┐
│          标题栏                      │
├─────────────────────────────────────┤
│  [添加记录] [统计]                   │
├─────────────────────────────────────┤
│                                     │
│            记录列表                  │
│                                     │
├─────────────────────────────────────┤
│            统计信息                  │
└─────────────────────────────────────┘
```

#### 移动端布局
```
┌─────────────────────────────────────┐
│          标题栏                      │
├─────────────────────────────────────┤
│  [+] [统计]                          │
├─────────────────────────────────────┤
│                                     │
│         记录列表（卡片式）            │
│                                     │
├─────────────────────────────────────┤
│         统计信息（横向滚动）          │
└─────────────────────────────────────┘
```

### 6.3 功能模块
1. **添加/编辑记录表单**
   - 日期选择器（移动端使用原生日期选择器）
   - 上班时间输入（支持时间选择器）
   - 下班时间输入（支持时间选择器）
   - 保存/取消按钮
   - 表单验证

2. **记录列表**
   - PC端：表格形式显示
   - 移动端：卡片式布局
   - 显示日期、上下班时间、工时、加班时间
   - 编辑/删除按钮（移动端使用滑动操作）
   - 分页功能（移动端使用无限滚动）
   - 搜索和筛选功能

3. **统计面板**
   - 今日工时
   - 本周汇总
   - 本月汇总
   - 图表展示（可选）
   - 移动端支持手势切换统计周期

## 7. Docker配置

### 7.1 Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "src/app.js"]
```

### 7.2 docker-compose.yml
```yaml
version: '3.8'

services:
  time-tracker:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./database:/app/database
      - ./src:/app/src
      - ./public:/app/public
    restart: unless-stopped
```

## 8. 部署方案

### 8.1 开发环境
1. 克隆代码到本地
2. 运行 `docker compose up`
3. 访问 http://localhost:3000

### 8.2 生产环境
1. 服务器安装Docker
2. 克隆代码
3. 修改docker-compose.yml（如有必要）
4. 运行 `docker compose up -d`
5. 配置反向代理（可选）

## 9. 性能优化

### 9.1 服务端优化
- 使用Express路由缓存
- SQLite连接池管理
- 静态资源缓存

### 9.2 前端优化
- CSS/JS压缩
- 图片懒加载
- 移动端触摸优化

## 10. 安全考虑

### 10.1 基础安全
- 输入验证和过滤
- SQL注入防护
- XSS防护

### 10.2 数据安全
- 定期数据库备份
- 访问日志记录
- 错误信息脱敏

## 11. 扩展计划

### 11.1 短期扩展
- 数据导出功能（Excel/PDF）
- 节假日自动识别
- 更多统计图表

### 11.2 多用户扩展方案

#### 11.2.1 用户管理
- 用户注册/登录/登出
- 用户角色权限管理（管理员/普通用户）
- 用户个人设置（时区、工时规则等）
- 数据隔离（每个用户只能看到自己的数据）

#### 11.2.2 团队功能
- 部门管理
- 团队统计报表
- 考勤审批流程
- 假期管理

#### 11.2.3 高级功能
- 移动App（React Native/Flutter）
- 第三方集成（企业微信/钉钉/飞书）
- 数据导出（Excel/PDF/邮件）
- API开放接口

#### 11.2.4 性能优化
- 数据库分表策略（按用户/时间）
- 缓存机制（Redis）
- 数据库升级（PostgreSQL/MySQL）
- 负载均衡

## 12. 开发规范

### 12.1 代码规范
- 使用ES6+语法
- 遵循Airbnb JavaScript规范
- 代码注释清晰

### 12.2 Git规范
- 功能分支开发
- 提交信息规范
- 定期代码审查

---

## 附录

### A. 工时计算示例
- 上班：08:00，下班：22:00
- 工作时长：14小时
- 实际工时：14 - 1 = 13小时
- 标准工时：10小时
- 加班时间：13 - 10 = 3小时

### B. 技术选型理由
- SQLite：轻量级，无需额外服务
- Node.js：单线程，资源占用少
- 原生JS：减少依赖，加载快速
- Docker：环境一致性，部署简单