const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { 
  getProfile, updateProfile, uploadAvatar,
  getBlueprint, updateDailyBlueprint,
  addBlueprintExercise, updateBlueprintExercise, deleteBlueprintExercise, uploadExerciseImage
} = require('../controllers/settingsController');

// Set up Multer for memory storage (file buffer)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.use(protect);

// Profile
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.post('/profile/avatar', upload.single('image'), uploadAvatar); // New upload route

// Blueprint routes remain the same...
router.get('/blueprint', getBlueprint);
router.patch('/blueprint/:dayName', updateDailyBlueprint);
router.post('/blueprint/:dayName/exercises', addBlueprintExercise);
router.patch('/blueprint/:dayName/exercises/:exerciseId', updateBlueprintExercise);
router.delete('/blueprint/:dayName/exercises/:exerciseId', deleteBlueprintExercise);
router.post('/blueprint/:dayName/exercises/:exerciseId/image', upload.single('image'), uploadExerciseImage);

module.exports = router;