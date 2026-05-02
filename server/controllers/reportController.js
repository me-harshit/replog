const Workout = require('../models/Workout');
const mongoose = require('mongoose');
const { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } = require('date-fns');

// Helper to get user ID safely
const getUserId = (req) => new mongoose.Types.ObjectId(req.user.id);

// 1. GET: /api/reports/weekly
exports.getWeeklyReport = async (req, res) => {
  try {
    // Get last 7 days including today
    const startDate = subDays(new Date(), 6);
    startDate.setHours(0, 0, 0, 0);

    const weeklyData = await Workout.aggregate([
      { $match: { userId: getUserId(req), date: { $gte: startDate }, attended: true } },
      { $unwind: "$exercises" },
      { $unwind: "$exercises.sets" },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          volume: { $sum: { $multiply: ["$exercises.sets.weight", "$exercises.sets.reps"] } }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.status(200).json({ data: weeklyData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. GET: /api/reports/monthly
exports.getMonthlyReport = async (req, res) => {
  try {
    const startDate = subDays(new Date(), 29); // Last 30 days
    startDate.setHours(0, 0, 0, 0);

    const muscleSplit = await Workout.aggregate([
      { $match: { userId: getUserId(req), date: { $gte: startDate }, attended: true } },
      {
        $group: {
          _id: "$muscleGroup",
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({ data: muscleSplit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. GET: /api/reports/all-time
exports.getAllTimeReport = async (req, res) => {
  try {
    const stats = await Workout.aggregate([
      { $match: { userId: getUserId(req) } },
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: { $cond: [{ $eq: ["$isRestDay", false] }, 1, 0] } },
          attendedWorkouts: { $sum: { $cond: ["$attended", 1, 0] } }
        }
      }
    ]);

    // Calculate total all-time volume
    const volume = await Workout.aggregate([
      { $match: { userId: getUserId(req), attended: true } },
      { $unwind: "$exercises" },
      { $unwind: "$exercises.sets" },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: { $multiply: ["$exercises.sets.weight", "$exercises.sets.reps"] } }
        }
      }
    ]);

    res.status(200).json({ 
      data: {
        workouts: stats[0] || { totalWorkouts: 0, attendedWorkouts: 0 },
        volume: volume[0] ? volume[0].totalVolume : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. GET: /api/reports/streak
exports.getStreakReport = async (req, res) => {
  try {
    // For a real app, streak logic can get complex (ignoring rest days, etc.)
    // Here is a simplified version: count recent consecutive attended workouts
    const recentWorkouts = await Workout.find({ userId: req.user.id, isRestDay: false })
      .sort({ date: -1 })
      .select('attended date');

    let currentStreak = 0;
    for (let w of recentWorkouts) {
      if (w.attended) {
        currentStreak++;
      } else {
        break; // Streak broken
      }
    }

    res.status(200).json({ data: { currentStreak } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};