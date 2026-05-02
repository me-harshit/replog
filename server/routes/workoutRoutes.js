const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getTodayWorkout, 
  getHistory,  
  getCalendarStats,  
  getWorkoutDetail,  
  updateExercise, 
  updateExerciseSets, 
  addExercise,
  deleteExercise,
  toggleAttendance
} = require('../controllers/workoutController');

// Apply 'protect' to ALL workout routes so only authenticated users can access them
router.use(protect); 

// ==========================================
// STATIC ROUTES (Must go before dynamic ones)
// ==========================================

// GET today's workout dashboard
router.get('/today', getTodayWorkout);
router.get('/history', getHistory);
router.get('/history/:id', getWorkoutDetail);
router.get('/calendar-stats', getCalendarStats);

// ==========================================
// DYNAMIC ROUTES (Rely on :workoutId)
// ==========================================

// PATCH individual exercise status (Swipe to complete/skip)
router.patch('/:workoutId/exercise/:exerciseId', updateExercise);

// PATCH individual exercise sets/reps (Auto-save)
router.patch('/:workoutId/exercise/:exerciseId/sets', updateExerciseSets);

// POST a new custom exercise to today's list
router.post('/:workoutId/exercises', addExercise);

// DELETE an exercise from today's list
router.delete('/:workoutId/exercise/:exerciseId', deleteExercise); // <-- 3. FIXED param from :id to :exerciseId

// PATCH to toggle today's attendance status
router.patch('/:workoutId/attendance', toggleAttendance);

module.exports = router;