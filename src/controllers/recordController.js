const TimeRecord = require('../models/TimeRecord');
const TimeCalculator = require('../utils/timeCalc');
const Validator = require('../utils/validation');

class RecordController {
    // 获取所有打卡记录
    static getAllRecords(req, res) {
        const pagination = Validator.validatePagination(req.query);
        TimeRecord.getAll(pagination.page, pagination.limit, (err, result) => {
            if (err) {
                console.error('Error getting records:', err);
                return res.status(500).json({
                    success: false,
                    message: '获取记录失败'
                });
            }
            
            res.json({
                success: true,
                data: result,
                message: '获取记录成功'
            });
        });
    }

    // 创建打卡记录
    static createRecord(req, res) {
        // 清理输入数据
        const data = Validator.sanitizeInput(req.body);
        
        // 验证数据
        const validation = Validator.validateTimeRecord(data);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: '数据验证失败',
                errors: validation.errors
            });
        }
        
        TimeRecord.create(data, (err, record) => {
            if (err) {
                console.error('Error creating record:', err);
                return res.status(500).json({
                    success: false,
                    message: '创建记录失败'
                });
            }
            
            res.status(201).json({
                success: true,
                data: record,
                message: '创建记录成功'
            });
        });
    }

    // 根据ID获取记录
    static getRecordById(req, res) {
        const { id } = req.params;
        TimeRecord.getById(id, (err, record) => {
            if (err) {
                console.error('Error getting record:', err);
                return res.status(500).json({
                    success: false,
                    message: '获取记录失败'
                });
            }
            
            if (!record) {
                return res.status(404).json({
                    success: false,
                    message: '记录不存在'
                });
            }
            
            res.json({
                success: true,
                data: record,
                message: '获取记录成功'
            });
        });
    }

    // 更新打卡记录
    static updateRecord(req, res) {
        const { id } = req.params;
        
        // 清理输入数据
        const data = Validator.sanitizeInput(req.body);
        
        // 验证数据
        const validation = Validator.validateTimeRecord(data);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: '数据验证失败',
                errors: validation.errors
            });
        }
        
        TimeRecord.update(id, data, (err, record) => {
            if (err) {
                console.error('Error updating record:', err);
                return res.status(500).json({
                    success: false,
                    message: '更新记录失败'
                });
            }
            
            if (!record) {
                return res.status(404).json({
                    success: false,
                    message: '记录不存在'
                });
            }
            
            res.json({
                success: true,
                data: record,
                message: '更新记录成功'
            });
        });
    }

    // 删除打卡记录
    static deleteRecord(req, res) {
        const { id } = req.params;
        TimeRecord.delete(id, (err, result) => {
            if (err) {
                console.error('Error deleting record:', err);
                return res.status(500).json({
                    success: false,
                    message: '删除记录失败'
                });
            }
            
            if (!result.deleted) {
                return res.status(404).json({
                    success: false,
                    message: '记录不存在'
                });
            }
            
            res.json({
                success: true,
                message: '删除记录成功'
            });
        });
    }

    // 获取每日统计
    static getDailyStats(req, res) {
        const { date } = req.query;
        
        if (!date || !TimeCalculator.isValidDate(date)) {
            return res.status(400).json({
                success: false,
                message: '请提供有效的日期参数 (YYYY-MM-DD)'
            });
        }
        
        TimeRecord.getByDateRange(date, date, (err, records) => {
            if (err) {
                console.error('Error getting daily stats:', err);
                return res.status(500).json({
                    success: false,
                    message: '获取每日统计失败'
                });
            }
            
            let stats = {
                date,
                workHours: 0,
                overtimeHours: 0,
                hasRecord: false
            };
            
            if (records.length > 0) {
                const dayRecord = records[0];
                stats = {
                    date,
                    workHours: dayRecord.work_hours,
                    overtimeHours: dayRecord.overtime_hours,
                    hasRecord: true,
                    checkInTime: dayRecord.check_in_time,
                    checkOutTime: dayRecord.check_out_time,
                    note: dayRecord.note
                };
            }
            
            res.json({
                success: true,
                data: stats,
                message: '获取每日统计成功'
            });
        });
    }

    // 获取每周统计
    static getWeeklyStats(req, res) {
        const { date } = req.query;
        
        if (!date || !TimeCalculator.isValidDate(date)) {
            return res.status(400).json({
                success: false,
                message: '请提供有效的日期参数 (YYYY-MM-DD)'
            });
        }
        
        const weekRange = TimeCalculator.getWeekRange(date);
        TimeRecord.getByDateRange(weekRange.start, weekRange.end, (err, records) => {
            if (err) {
                console.error('Error getting weekly stats:', err);
                return res.status(500).json({
                    success: false,
                    message: '获取每周统计失败'
                });
            }
            
            const stats = {
                weekStart: weekRange.start,
                weekEnd: weekRange.end,
                totalWorkHours: 0,
                totalOvertimeHours: 0,
                workDays: records.length,
                averageWorkHours: 0,
                records: records
            };
            
            if (records.length > 0) {
                stats.totalWorkHours = Math.round(records.reduce((sum, r) => sum + r.work_hours, 0) * 100) / 100;
                stats.totalOvertimeHours = Math.round(records.reduce((sum, r) => sum + r.overtime_hours, 0) * 100) / 100;
                stats.averageWorkHours = Math.round((stats.totalWorkHours / records.length) * 100) / 100;
            }
            
            res.json({
                success: true,
                data: stats,
                message: '获取每周统计成功'
            });
        });
    }

    // 获取每月统计
    static getMonthlyStats(req, res) {
        const { date } = req.query;
        
        if (!date || !TimeCalculator.isValidDate(date)) {
            return res.status(400).json({
                success: false,
                message: '请提供有效的日期参数 (YYYY-MM-DD)'
            });
        }
        
        const monthRange = TimeCalculator.getMonthRange(date);
        TimeRecord.getByDateRange(monthRange.start, monthRange.end, (err, records) => {
            if (err) {
                console.error('Error getting monthly stats:', err);
                return res.status(500).json({
                    success: false,
                    message: '获取每月统计失败'
                });
            }
            
            const stats = {
                monthStart: monthRange.start,
                monthEnd: monthRange.end,
                totalWorkHours: 0,
                totalOvertimeHours: 0,
                workDays: records.length,
                averageWorkHours: 0,
                records: records
            };
            
            if (records.length > 0) {
                stats.totalWorkHours = Math.round(records.reduce((sum, r) => sum + r.work_hours, 0) * 100) / 100;
                stats.totalOvertimeHours = Math.round(records.reduce((sum, r) => sum + r.overtime_hours, 0) * 100) / 100;
                stats.averageWorkHours = Math.round((stats.totalWorkHours / records.length) * 100) / 100;
            }
            
            res.json({
                success: true,
                data: stats,
                message: '获取每月统计成功'
            });
        });
    }

    // 获取日期范围统计
    static getRangeStats(req, res) {
        const { start, end } = req.query;
        
        // 验证日期范围
        const validation = Validator.validateDateRange({ start, end });
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: '日期范围参数无效',
                errors: validation.errors
            });
        }
        
        TimeRecord.getByDateRange(start, end, (err, records) => {
            if (err) {
                console.error('Error getting range stats:', err);
                return res.status(500).json({
                    success: false,
                    message: '获取日期范围统计失败'
                });
            }
            
            const stats = {
                dateRange: { start, end },
                totalWorkHours: 0,
                totalOvertimeHours: 0,
                workDays: records.length,
                averageWorkHours: 0,
                records: records
            };
            
            if (records.length > 0) {
                stats.totalWorkHours = Math.round(records.reduce((sum, r) => sum + r.work_hours, 0) * 100) / 100;
                stats.totalOvertimeHours = Math.round(records.reduce((sum, r) => sum + r.overtime_hours, 0) * 100) / 100;
                stats.averageWorkHours = Math.round((stats.totalWorkHours / records.length) * 100) / 100;
            }
            
            res.json({
                success: true,
                data: stats,
                message: '获取日期范围统计成功'
            });
        });
    }
}

module.exports = RecordController;