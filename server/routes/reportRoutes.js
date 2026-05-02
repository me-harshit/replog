const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getWeeklyReport, 
  getMonthlyReport, 
  getAllTimeReport, 
  getStreakReport 
} = require('../controllers/reportController');

// All report routes require authentication
router.use(protect);

router.get('/weekly', getWeeklyReport);
router.get('/monthly', getMonthlyReport);
router.get('/all-time', getAllTimeReport);
router.get('/streak', getStreakReport);

module.exports = router;