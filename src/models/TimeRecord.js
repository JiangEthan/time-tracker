const { db } = require('../config/database');

class TimeRecord {
    // 创建打卡记录
    static create(recordData, callback) {
        const { date, check_in_time, check_out_time, note } = recordData;
        
        // 计算工时和加班时间
        const workHours = this.calculateWorkHours(check_in_time, check_out_time);
        const overtimeHours = Math.max(0, workHours - 10); // 标准工时10小时
        
        const sql = `INSERT INTO time_records 
            (date, check_in_time, check_out_time, work_hours, overtime_hours, note) 
            VALUES (?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, [date, check_in_time, check_out_time, workHours, overtimeHours, note], function(err) {
            if (err) {
                callback(err);
            } else {
                callback(null, { id: this.lastID, ...recordData, work_hours: workHours, overtime_hours: overtimeHours });
            }
        });
    }

    // 获取所有记录
    static getAll(page = 1, limit = 50, callback) {
        const offset = (page - 1) * limit;
        
        // 获取总数
        db.get("SELECT COUNT(*) as total FROM time_records", (err, row) => {
            if (err) {
                callback(err);
                return;
            }
            
            const total = row.total;
            
            // 获取分页数据
            const sql = `SELECT * FROM time_records 
                       ORDER BY date DESC, created_at DESC 
                       LIMIT ? OFFSET ?`;
            
            db.all(sql, [limit, offset], (err, records) => {
                if (err) {
                    callback(err);
                } else {
                    callback(null, {
                        records,
                        pagination: {
                            current_page: page,
                            total_pages: Math.ceil(total / limit),
                            total_records: total,
                            has_next: page < Math.ceil(total / limit),
                            has_prev: page > 1
                        }
                    });
                }
            });
        });
    }

    // 根据ID获取记录
    static getById(id, callback) {
        const sql = "SELECT * FROM time_records WHERE id = ?";
        db.get(sql, [id], callback);
    }

    // 更新记录
    static update(id, recordData, callback) {
        const { date, check_in_time, check_out_time, note } = recordData;
        
        // 计算工时和加班时间
        const workHours = this.calculateWorkHours(check_in_time, check_out_time);
        const overtimeHours = Math.max(0, workHours - 10);
        
        const sql = `UPDATE time_records 
                   SET date = ?, check_in_time = ?, check_out_time = ?, 
                       work_hours = ?, overtime_hours = ?, note = ?, 
                       updated_at = CURRENT_TIMESTAMP 
                   WHERE id = ?`;
        
        db.run(sql, [date, check_in_time, check_out_time, workHours, overtimeHours, note, id], function(err) {
            if (err) {
                callback(err);
            } else if (this.changes === 0) {
                callback(null, null);
            } else {
                callback(null, { id, ...recordData, work_hours: workHours, overtime_hours: overtimeHours });
            }
        });
    }

    // 删除记录
    static delete(id, callback) {
        const sql = "DELETE FROM time_records WHERE id = ?";
        db.run(sql, [id], function(err) {
            if (err) {
                callback(err);
            } else {
                callback(null, { deleted: this.changes > 0 });
            }
        });
    }

    // 获取日期范围记录
    static getByDateRange(startDate, endDate, callback) {
        const sql = `SELECT * FROM time_records 
                   WHERE date BETWEEN ? AND ? 
                   ORDER BY date DESC, created_at DESC`;
        db.all(sql, [startDate, endDate], callback);
    }

    // 计算工时
    static calculateWorkHours(checkInTime, checkOutTime) {
        const [checkInHour, checkInMinute] = checkInTime.split(':').map(Number);
        const [checkOutHour, checkOutMinute] = checkOutTime.split(':').map(Number);
        
        let totalHours = checkOutHour - checkInHour;
        let totalMinutes = checkOutMinute - checkInMinute;
        
        if (totalMinutes < 0) {
            totalHours--;
            totalMinutes += 60;
        }
        
        const workHours = totalHours + (totalMinutes / 60);
        
        // 扣除1小时午休
        return Math.max(0, workHours - 1);
    }
}

module.exports = TimeRecord;