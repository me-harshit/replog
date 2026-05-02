const mongoose = require('mongoose');

const ScheduleExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  setsCount: { type: Number, default: 3 },
  targetReps: { type: String, default: '10' },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' }
});

const DayPlanSchema = new mongoose.Schema({
  dayName: { type: String, required: true }, // e.g., 'Monday'
  muscleGroup: { type: String, required: true },
  isRestDay: { type: Boolean, default: false },
  exercises: [ScheduleExerciseSchema]
});

const WeeklyScheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  days: [DayPlanSchema]
}, { timestamps: true });

module.exports = mongoose.model('WeeklySchedule', WeeklyScheduleSchema);