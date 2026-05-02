const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', registerUser); // This was missing
router.post('/login', loginUser);       // This was missing

// Protected Routes
router.get('/me', protect, getUserProfile);

// Admin Only Route
router.get('/admin-panel', protect, admin, (req, res) => {
  res.json({ message: "Welcome to the Admin Command Center." });
});

module.exports = router;