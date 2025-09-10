const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, '../../database/time_tracker.db');

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('Connected to SQLite database.');
        // 启用外键约束
        db.run('PRAGMA foreign_keys = ON');
        initDatabase();
    }
});

function initDatabase() {

  // 创建表结构
    // 创建用户表（为多用户扩展预留）
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT UNIQUE,
        full_name TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 创建打卡记录表
    db.run(`CREATE TABLE IF NOT EXISTS time_records (
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
    )`);

    // 创建系统配置表
    db.run(`CREATE TABLE IF NOT EXISTS system_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,            -- 用户ID，NULL表示全局配置
        config_key TEXT NOT NULL,
        config_value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 创建索引
    db.run(`CREATE INDEX IF NOT EXISTS idx_date ON time_records(date)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_user_date ON time_records(user_id, date)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_username ON users(username)`);

    // 插入默认系统配置
    const defaultConfigs = [
        { key: 'standard_work_hours', value: '10' },
        { key: 'lunch_break_hours', value: '1' },
        { key: 'work_start_time', value: '09:00' },
        { key: 'work_end_time', value: '20:00' }
    ];

    let completed = 0;
    defaultConfigs.forEach(config => {
        db.run(`INSERT OR IGNORE INTO system_config (config_key, config_value) VALUES (?, ?)`, 
            [config.key, config.value], (err) => {
                if (err) console.error('Error inserting config:', err);
                completed++;
                if (completed === defaultConfigs.length) {
                    console.log('Database tables created successfully.');
                    // 关闭数据库连接
                    db.close((err) => {
                        if (err) console.error('Error closing database:', err);
                        else console.log('Database connection closed.');
                    });
                }
            });
    });
}