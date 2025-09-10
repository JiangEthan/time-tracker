const express = require('express');
const router = express.Router();

// 导入控制器
const recordController = require('../controllers/recordController');

// 打卡记录路由
router.get('/records', recordController.getAllRecords);
router.post('/records', recordController.createRecord);
router.get('/records/:id', recordController.getRecordById);
router.put('/records/:id', recordController.updateRecord);
router.delete('/records/:id', recordController.deleteRecord);

// 统计路由
router.get('/stats/daily', recordController.getDailyStats);
router.get('/stats/weekly', recordController.getWeeklyStats);
router.get('/stats/monthly', recordController.getMonthlyStats);
router.get('/stats/range', recordController.getRangeStats);

module.exports = router;