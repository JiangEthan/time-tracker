const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database/time_tracker.db');

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        // 启用外键约束
        db.run('PRAGMA foreign_keys = ON');
    }
});

module.exports = { db, dbPath };