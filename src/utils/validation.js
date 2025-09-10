const TimeCalculator = require('./timeCalc');

/**
 * 数据验证工具
 */
class Validator {
    /**
     * 验证打卡记录数据
     * @param {Object} data - 打卡记录数据
     * @returns {Object} 验证结果
     */
    static validateTimeRecord(data) {
        const errors = [];
        
        // 验证日期
        if (!data.date) {
            errors.push('日期不能为空');
        } else if (!TimeCalculator.isValidDate(data.date)) {
            errors.push('日期格式不正确，应为 YYYY-MM-DD');
        }
        
        // 验证上班时间
        if (!data.check_in_time) {
            errors.push('上班时间不能为空');
        } else if (!TimeCalculator.isValidTime(data.check_in_time)) {
            errors.push('上班时间格式不正确，应为 HH:MM');
        }
        
        // 验证下班时间
        if (!data.check_out_time) {
            errors.push('下班时间不能为空');
        } else if (!TimeCalculator.isValidTime(data.check_out_time)) {
            errors.push('下班时间格式不正确，应为 HH:MM');
        }
        
        // 验证时间逻辑
        if (data.check_in_time && data.check_out_time && TimeCalculator.isValidTime(data.check_in_time) && TimeCalculator.isValidTime(data.check_out_time)) {
            const [inHour, inMinute] = data.check_in_time.split(':').map(Number);
            const [outHour, outMinute] = data.check_out_time.split(':').map(Number);
            
            const inTotal = inHour * 60 + inMinute;
            const outTotal = outHour * 60 + outMinute;
            
            if (outTotal <= inTotal) {
                errors.push('下班时间必须晚于上班时间');
            }
            
            // 检查扣除午休后是否还有工时
            const workHours = TimeCalculator.calculateWorkHours(data.check_in_time, data.check_out_time);
            if (workHours <= 0) {
                errors.push('工作时间太短，请检查时间输入');
            }
        }
        
        // 验证备注长度
        if (data.note && data.note.length > 200) {
            errors.push('备注不能超过200个字符');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 验证分页参数
     * @param {Object} params - 分页参数
     * @returns {Object} 验证后的分页参数
     */
    static validatePagination(params) {
        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 50;
        
        return {
            page: Math.max(1, page),
            limit: Math.min(100, Math.max(1, limit)) // 限制最大100条
        };
    }

    /**
     * 验证日期范围参数
     * @param {Object} params - 日期范围参数
     * @returns {Object} 验证结果
     */
    static validateDateRange(params) {
        const errors = [];
        
        if (!params.start) {
            errors.push('开始日期不能为空');
        } else if (!TimeCalculator.isValidDate(params.start)) {
            errors.push('开始日期格式不正确');
        }
        
        if (!params.end) {
            errors.push('结束日期不能为空');
        } else if (!TimeCalculator.isValidDate(params.end)) {
            errors.push('结束日期格式不正确');
        }
        
        if (params.start && params.end && TimeCalculator.isValidDate(params.start) && TimeCalculator.isValidDate(params.end)) {
            const startDate = new Date(params.start);
            const endDate = new Date(params.end);
            
            if (startDate > endDate) {
                errors.push('开始日期不能晚于结束日期');
            }
            
            // 限制查询范围不超过1年
            const oneYear = 365 * 24 * 60 * 60 * 1000;
            if (endDate - startDate > oneYear) {
                errors.push('查询范围不能超过1年');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 清理和过滤输入数据
     * @param {Object} data - 输入数据
     * @returns {Object} 清理后的数据
     */
    static sanitizeInput(data) {
        const sanitized = {};
        
        // 只允许特定字段
        const allowedFields = ['date', 'check_in_time', 'check_out_time', 'note'];
        
        allowedFields.forEach(field => {
            if (data[field] !== undefined) {
                // 去除首尾空格
                if (typeof data[field] === 'string') {
                    sanitized[field] = data[field].trim();
                } else {
                    sanitized[field] = data[field];
                }
            }
        });
        
        return sanitized;
    }
}

module.exports = Validator;