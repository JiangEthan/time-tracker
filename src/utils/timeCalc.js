/**
 * 工时计算工具函数
 */

class TimeCalculator {
    /**
     * 计算实际工时
     * @param {string} checkInTime - 上班时间 (HH:MM)
     * @param {string} checkOutTime - 下班时间 (HH:MM)
     * @param {number} lunchBreakHours - 午休时间（小时）
     * @returns {number} 实际工时
     */
    static calculateWorkHours(checkInTime, checkOutTime, lunchBreakHours = 1) {
        const [checkInHour, checkInMinute] = checkInTime.split(':').map(Number);
        const [checkOutHour, checkOutMinute] = checkOutTime.split(':').map(Number);
        
        // 计算总分钟数
        const totalMinutes = (checkOutHour * 60 + checkOutMinute) - (checkInHour * 60 + checkInMinute);
        
        // 转换为小时
        const totalHours = totalMinutes / 60;
        
        // 扣除午休时间
        const actualHours = Math.max(0, totalHours - lunchBreakHours);
        
        // 保留两位小数
        return Math.round(actualHours * 100) / 100;
    }

    /**
     * 计算加班时间
     * @param {number} actualHours - 实际工时
     * @param {number} standardHours - 标准工时
     * @returns {number} 加班时间
     */
    static calculateOvertime(actualHours, standardHours = 10) {
        const overtime = actualHours - standardHours;
        return Math.max(0, Math.round(overtime * 100) / 100);
    }

    /**
     * 格式化时间显示
     * @param {number} hours - 小时数
     * @returns {string} 格式化后的时间 (X小时Y分钟)
     */
    static formatHours(hours) {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}小时${m}分钟`;
    }

    /**
     * 将分钟数转换为小时格式
     * @param {number} minutes - 分钟数
     * @returns {number} 小时数
     */
    static minutesToHours(minutes) {
        return Math.round((minutes / 60) * 100) / 100;
    }

    /**
     * 验证时间格式
     * @param {string} time - 时间字符串 (HH:MM)
     * @returns {boolean} 是否有效
     */
    static isValidTime(time) {
        const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return regex.test(time);
    }

    /**
     * 验证日期格式
     * @param {string} date - 日期字符串 (YYYY-MM-DD)
     * @returns {boolean} 是否有效
     */
    static isValidDate(date) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(date)) return false;
        
        const d = new Date(date);
        return d instanceof Date && !isNaN(d);
    }

    /**
     * 获取某一周的开始和结束日期
     * @param {string} date - 日期字符串 (YYYY-MM-DD)
     * @returns {Object} 包含开始和结束日期
     */
    static getWeekRange(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 调整到周一
        
        const startDate = new Date(d.setDate(diff));
        const endDate = new Date(d.setDate(diff + 6));
        
        return {
            start: this.formatDate(startDate),
            end: this.formatDate(endDate)
        };
    }

    /**
     * 获取某一月的开始和结束日期
     * @param {string} date - 日期字符串 (YYYY-MM-DD)
     * @returns {Object} 包含开始和结束日期
     */
    static getMonthRange(date) {
        const d = new Date(date);
        const startDate = new Date(d.getFullYear(), d.getMonth(), 1);
        const endDate = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        
        return {
            start: this.formatDate(startDate),
            end: this.formatDate(endDate)
        };
    }

    /**
     * 格式化日期为 YYYY-MM-DD
     * @param {Date} date - 日期对象
     * @returns {string} 格式化后的日期
     */
    static formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * 计算两个日期之间的工作日数
     * @param {string} startDate - 开始日期
     * @param {string} endDate - 结束日期
     * @returns {number} 工作日数
     */
    static getWorkDaysBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        let workDays = 0;
        
        const current = new Date(start);
        while (current <= end) {
            const day = current.getDay();
            if (day !== 0 && day !== 6) { // 排除周末
                workDays++;
            }
            current.setDate(current.getDate() + 1);
        }
        
        return workDays;
    }
}

module.exports = TimeCalculator;