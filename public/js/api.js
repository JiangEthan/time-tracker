/**
 * API调用模块
 */

class Api {
    constructor() {
        this.baseUrl = '/api';
    }

    // 通用请求方法
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const config = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || '请求失败');
            }
            
            return data;
        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    }

    // 获取打卡记录
    async getRecords(page = 1, limit = 50) {
        return this.request(`/records?page=${page}&limit=${limit}`);
    }

    // 创建打卡记录
    async createRecord(data) {
        return this.request('/records', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // 获取单条记录
    async getRecord(id) {
        return this.request(`/records/${id}`);
    }

    // 更新记录
    async updateRecord(id, data) {
        return this.request(`/records/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // 删除记录
    async deleteRecord(id) {
        return this.request(`/records/${id}`, {
            method: 'DELETE'
        });
    }

    // 获取每日统计
    async getDailyStats(date) {
        return this.request(`/stats/daily?date=${date}`);
    }

    // 获取每周统计
    async getWeeklyStats(date) {
        return this.request(`/stats/weekly?date=${date}`);
    }

    // 获取每月统计
    async getMonthlyStats(date) {
        return this.request(`/stats/monthly?date=${date}`);
    }

    // 获取日期范围统计
    async getRangeStats(startDate, endDate) {
        return this.request(`/stats/range?start=${startDate}&end=${endDate}`);
    }
}

// 创建API实例
const api = new Api();

// 导出API实例
window.api = api;