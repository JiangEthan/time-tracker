/**
 * 工时管理系统前端主逻辑
 */

class TimeTrackerApp {
    constructor() {
        this.currentPage = 1;
        this.currentLimit = 20;
        this.totalPages = 1;
        this.editingId = null;
        this.monthFilter = '';
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadRecords();
        this.loadTodayStats();
        
        // 设置今天的日期为默认值
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    // 绑定事件
    bindEvents() {
        // 添加记录按钮
        document.getElementById('addRecordBtn').addEventListener('click', () => {
            this.showForm();
        });

        // 统计按钮
        document.getElementById('statsBtn').addEventListener('click', () => {
            this.toggleStats();
        });

        // 表单提交
        document.getElementById('timeRecordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRecord();
        });

        // 取消按钮
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideForm();
        });

        // 月份筛选
        document.getElementById('monthFilter').addEventListener('change', (e) => {
            this.monthFilter = e.target.value;
            this.currentPage = 1;
            this.loadRecords();
        });

        // 清除筛选
        document.getElementById('clearFilterBtn').addEventListener('click', () => {
            document.getElementById('monthFilter').value = '';
            this.monthFilter = '';
            this.currentPage = 1;
            this.loadRecords();
        });

        // 统计标签切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchStatsTab(btn.dataset.tab);
            });
        });

        // 移动端滑动删除支持
        this.initSwipeToDelete();
    }

    // 显示表单
    showForm(record = null) {
        const form = document.getElementById('recordForm');
        const formTitle = document.getElementById('formTitle');
        
        if (record) {
            formTitle.textContent = '编辑打卡记录';
            document.getElementById('recordId').value = record.id;
            document.getElementById('date').value = record.date;
            document.getElementById('checkInTime').value = record.check_in_time;
            document.getElementById('checkOutTime').value = record.check_out_time;
            document.getElementById('note').value = record.note || '';
            this.editingId = record.id;
        } else {
            formTitle.textContent = '添加打卡记录';
            document.getElementById('timeRecordForm').reset();
            document.getElementById('date').value = new Date().toISOString().split('T')[0];
            this.editingId = null;
        }
        
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    }

    // 隐藏表单
    hideForm() {
        document.getElementById('recordForm').style.display = 'none';
        document.getElementById('timeRecordForm').reset();
        this.editingId = null;
    }

    // 保存记录
    async saveRecord() {
        const formData = {
            date: document.getElementById('date').value,
            check_in_time: document.getElementById('checkInTime').value,
            check_out_time: document.getElementById('checkOutTime').value,
            note: document.getElementById('note').value
        };

        try {
            let result;
            if (this.editingId) {
                result = await api.updateRecord(this.editingId, formData);
            } else {
                result = await api.createRecord(formData);
            }

            this.showToast(result.message, 'success');
            this.hideForm();
            this.loadRecords();
            this.loadTodayStats();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    // 加载记录列表
    async loadRecords() {
        try {
            let url = `/records?page=${this.currentPage}&limit=${this.currentLimit}`;
            
            if (this.monthFilter) {
                const [year, month] = this.monthFilter.split('-');
                const startDate = `${year}-${month}-01`;
                const endDate = new Date(year, month, 0).toISOString().split('T')[0];
                url = `/stats/range?start=${startDate}&end=${endDate}`;
                
                const result = await api.getRangeStats(startDate, endDate);
                this.displayRecords(result.data.records);
                this.updatePagination({ current_page: 1, total_pages: 1 });
            } else {
                const result = await api.getRecords(this.currentPage, this.currentLimit);
                this.displayRecords(result.data.records);
                this.updatePagination(result.data.pagination);
            }
        } catch (error) {
            this.showToast('加载记录失败', 'error');
        }
    }

    // 显示记录
    displayRecords(records) {
        // PC端表格
        const tbody = document.getElementById('recordsTableBody');
        tbody.innerHTML = '';
        
        records.forEach(record => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${record.date}</td>
                <td>${record.check_in_time}</td>
                <td>${record.check_out_time}</td>
                <td>${this.formatHours(record.work_hours)}</td>
                <td>${this.formatHours(record.overtime_hours)}</td>
                <td>${record.note || '-'}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-primary" onclick="app.showForm(${JSON.stringify(record).replace(/"/g, '&quot;')})">编辑</button>
                        <button class="btn btn-danger" onclick="app.deleteRecord(${record.id})">删除</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // 移动端卡片
        const recordsList = document.getElementById('recordsList');
        recordsList.innerHTML = '';
        
        records.forEach(record => {
            const card = document.createElement('div');
            card.className = 'record-card';
            card.dataset.recordId = record.id;
            card.innerHTML = `
                <div class="record-header">
                    <span class="record-date">${record.date}</span>
                    <div class="record-actions">
                        <button class="btn btn-primary" onclick="app.showForm(${JSON.stringify(record).replace(/"/g, '&quot;')})">编辑</button>
                    </div>
                </div>
                <div class="record-time">
                    <div class="record-time-item">
                        <span class="record-time-label">上班</span>
                        <span class="record-time-value">${record.check_in_time}</span>
                    </div>
                    <div class="record-time-item">
                        <span class="record-time-label">下班</span>
                        <span class="record-time-value">${record.check_out_time}</span>
                    </div>
                </div>
                <div class="record-stats">
                    <div class="record-stat">
                        <div class="record-stat-label">工时</div>
                        <div class="record-stat-value work-hours">${this.formatHours(record.work_hours)}</div>
                    </div>
                    <div class="record-stat">
                        <div class="record-stat-label">加班</div>
                        <div class="record-stat-value overtime">${this.formatHours(record.overtime_hours)}</div>
                    </div>
                </div>
                ${record.note ? `<div class="record-note">${record.note}</div>` : ''}
                <div class="delete-action" onclick="app.deleteRecord(${record.id})">删除</div>
            `;
            recordsList.appendChild(card);
        });
    }

    // 删除记录
    async deleteRecord(id) {
        if (!confirm('确定要删除这条记录吗？')) {
            return;
        }

        try {
            const result = await api.deleteRecord(id);
            this.showToast(result.message, 'success');
            this.loadRecords();
            this.loadTodayStats();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    // 更新分页
    updatePagination(pagination) {
        const paginationEl = document.getElementById('pagination');
        this.totalPages = pagination.total_pages;
        
        let html = '';
        
        // 上一页按钮
        html += `<button ${pagination.has_prev ? '' : 'disabled'} onclick="app.goToPage(${pagination.current_page - 1})">上一页</button>`;
        
        // 页码信息
        html += `<span class="page-info">第 ${pagination.current_page} 页，共 ${pagination.total_pages} 页</span>`;
        
        // 下一页按钮
        html += `<button ${pagination.has_next ? '' : 'disabled'} onclick="app.goToPage(${pagination.current_page + 1})">下一页</button>`;
        
        paginationEl.innerHTML = html;
    }

    // 跳转页面
    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadRecords();
        }
    }

    // 切换统计面板
    toggleStats() {
        const statsPanel = document.getElementById('statsPanel');
        const isVisible = statsPanel.style.display !== 'none';
        
        if (isVisible) {
            statsPanel.style.display = 'none';
        } else {
            statsPanel.style.display = 'block';
            this.loadAllStats();
        }
    }

    // 切换统计标签
    switchStatsTab(tab) {
        // 更新标签状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        // 显示对应内容
        document.querySelectorAll('.stats-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`${tab}Stats`).style.display = 'block';
    }

    // 加载今日统计
    async loadTodayStats() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const result = await api.getDailyStats(today);
            
            if (result.data.hasRecord) {
                document.getElementById('todayWorkHours').textContent = this.formatHours(result.data.workHours);
                document.getElementById('todayOvertime').textContent = this.formatHours(result.data.overtimeHours);
            }
        } catch (error) {
            console.error('加载今日统计失败:', error);
        }
    }

    // 加载所有统计
    async loadAllStats() {
        const today = new Date().toISOString().split('T')[0];
        
        try {
            // 并行加载所有统计数据
            const [daily, weekly, monthly] = await Promise.all([
                api.getDailyStats(today),
                api.getWeeklyStats(today),
                api.getMonthlyStats(today)
            ]);
            
            // 更新今日统计
            if (daily.data.hasRecord) {
                document.getElementById('todayWorkHours').textContent = this.formatHours(daily.data.workHours);
                document.getElementById('todayOvertime').textContent = this.formatHours(daily.data.overtimeHours);
            }
            
            // 更新本周统计
            document.getElementById('weekWorkHours').textContent = this.formatHours(weekly.data.totalWorkHours);
            document.getElementById('weekOvertime').textContent = this.formatHours(weekly.data.totalOvertimeHours);
            document.getElementById('weekWorkDays').textContent = `${weekly.data.workDays}天`;
            
            // 更新本月统计
            document.getElementById('monthWorkHours').textContent = this.formatHours(monthly.data.totalWorkHours);
            document.getElementById('monthOvertime').textContent = this.formatHours(monthly.data.totalOvertimeHours);
            document.getElementById('monthWorkDays').textContent = `${monthly.data.workDays}天`;
        } catch (error) {
            this.showToast('加载统计数据失败', 'error');
        }
    }

    // 初始化滑动删除
    initSwipeToDelete() {
        if (!('ontouchstart' in window)) return;
        
        let touchStartX = 0;
        let currentCard = null;
        
        document.addEventListener('touchstart', (e) => {
            const card = e.target.closest('.record-card');
            if (!card) return;
            
            // 关闭其他已打开的卡片
            document.querySelectorAll('.record-card.swipe-left').forEach(c => {
                if (c !== card) c.classList.remove('swipe-left');
            });
            
            touchStartX = e.touches[0].clientX;
            currentCard = card;
            currentCard.classList.add('swiping');
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!currentCard) return;
            
            const touchX = e.touches[0].clientX;
            const deltaX = touchX - touchStartX;
            
            if (deltaX < -50) {
                currentCard.classList.add('swipe-left');
            } else {
                currentCard.classList.remove('swipe-left');
            }
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            if (currentCard) {
                currentCard.classList.remove('swiping');
            }
            currentCard = null;
        });
    }

    // 格式化工时显示
    formatHours(hours) {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}小时${m}分钟`;
    }

    // 显示提示消息
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        
        // 显示
        setTimeout(() => toast.classList.add('show'), 10);
        
        // 3秒后隐藏
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// 初始化应用
const app = new TimeTrackerApp();