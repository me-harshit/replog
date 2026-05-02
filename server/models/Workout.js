const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },   
  sets: [{
    reps: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false }
  }],
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'skipped'], 
    default: 'pending' 
  },
  order: { type: Number }
});

const WorkoutSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true }, // For future Auth
  date: { type: Date, required: true },
  dayName: { type: String, required: true }, // e.g., "Monday"
  muscleGroup: { type: String, required: true },
  exercises: [ExerciseSchema],
  isRestDay: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Workout', WorkoutSchema);