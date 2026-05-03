require('dotenv').config();
const mongoose = require('mongoose');

// Import your Mongoose Models
// Adjust the paths if your models are located elsewhere
const User = require('../models/User');
const WeeklySchedule = require('../models/WeeklySchedule');
const Workout = require('../models/Workout');

const targetEmail = 'test@gmail.com';

const masterRoutine = [
  {
    dayName: 'Monday',
    muscleGroup: 'Back + Biceps',
    isRestDay: false,
    exercises: [
      { name: 'Assisted Pull-Ups', setsCount: 3, targetReps: '6-10', description: 'Focus on lat engagement.' },
      { name: 'Lat Pulldown', setsCount: 3, targetReps: '10', description: 'Control the eccentric.' },
      { name: 'Seated Cable Row', setsCount: 3, targetReps: '10', description: 'Squeeze shoulder blades together.' },
      { name: 'One-arm Dumbbell Row', setsCount: 3, targetReps: '10', description: '10 reps each side.' },
      { name: 'Straight Arm Pulldown', setsCount: 3, targetReps: '12', description: 'Keep arms slightly bent but rigid.' },
      { name: 'Dumbbell Curl', setsCount: 3, targetReps: '12', description: 'Supinate at the top.' },
      { name: 'Hammer Curl', setsCount: 3, targetReps: '12', description: 'Neutral grip.' }
    ]
  },
  {
    dayName: 'Tuesday',
    muscleGroup: 'Chest + Triceps',
    isRestDay: false,
    exercises: [
      { name: 'Bench Press', setsCount: 3, targetReps: '8-10', description: 'Keep feet planted, slight arch.' },
      { name: 'Incline Dumbbell Press', setsCount: 3, targetReps: '10', description: 'Focus on upper chest contraction.' },
      { name: 'Pec Deck / Cable Fly', setsCount: 3, targetReps: '12', description: 'Hug the tree.' },
      { name: 'Pushups', setsCount: 2, targetReps: 'Failure', description: 'Strict form until failure.' },
      { name: 'Rope Pushdown', setsCount: 3, targetReps: '12', description: 'Flare the rope at the bottom.' },
      { name: 'Overhead Dumbbell Extension', setsCount: 3, targetReps: '12', description: 'Full stretch at the bottom.' }
    ]
  },
  {
    dayName: 'Wednesday',
    muscleGroup: 'Active Recovery',
    isRestDay: true,
    exercises: [
      { name: 'Walking', setsCount: 1, targetReps: '20-30 Min', description: 'Light pace.' },
      { name: 'Stretching & Mobility', setsCount: 1, targetReps: '10 Min', description: 'Full body flow.' }
    ]
  },
  {
    dayName: 'Thursday',
    muscleGroup: 'Shoulders + Abs',
    isRestDay: false,
    exercises: [
      { name: 'Dumbbell Shoulder Press', setsCount: 3, targetReps: '10', description: 'Don\'t arch lower back excessively.' },
      { name: 'Lateral Raises', setsCount: 3, targetReps: '12', description: 'Pour the water pitcher at the top.' },
      { name: 'Front Raises', setsCount: 3, targetReps: '12', description: 'Control the descent.' },
      { name: 'Rear Delt Fly', setsCount: 3, targetReps: '12', description: 'Lead with the elbows.' },
      { name: 'Plank', setsCount: 3, targetReps: '30-45 Sec', description: 'Keep core tight, glutes engaged.' },
      { name: 'Leg Raises', setsCount: 3, targetReps: '15', description: 'Control the lower portion.' }
    ]
  },
  {
    dayName: 'Friday',
    muscleGroup: 'Arms + Cardio',
    isRestDay: false,
    exercises: [
      { name: 'Barbell Curl', setsCount: 3, targetReps: '10', description: 'Strict form, no swinging.' },
      { name: 'Concentration Curl', setsCount: 3, targetReps: '12', description: 'Squeeze hard at the peak.' },
      { name: 'Skull Crushers', setsCount: 3, targetReps: '10', description: 'Elbows tucked in.' },
      { name: 'Tricep Pushdown', setsCount: 3, targetReps: '12', description: 'Lockout at the bottom.' },
      { name: 'Incline Walking', setsCount: 1, targetReps: '10-15 Min', description: 'Steady state cardio.' }
    ]
  },
  {
    dayName: 'Saturday',
    muscleGroup: 'Legs',
    isRestDay: false,
    exercises: [
      { name: 'Squats', setsCount: 3, targetReps: '10', description: 'Hit depth, drive through mid-foot.' },
      { name: 'Leg Press', setsCount: 3, targetReps: '10', description: 'Don\'t lock knees out completely.' },
      { name: 'Leg Extension', setsCount: 3, targetReps: '12', description: 'Hold for 1 sec at the top.' },
      { name: 'Leg Curl', setsCount: 3, targetReps: '12', description: 'Slow eccentric.' },
      { name: 'Standing Calf Raises', setsCount: 3, targetReps: '15', description: 'Full stretch at the bottom.' }
    ]
  },
  {
    dayName: 'Sunday',
    muscleGroup: 'Full Rest',
    isRestDay: true,
    exercises: []
  }
];

const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.');

    // 1. Verify User Exists (Do not delete user)
    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      console.error(`❌ User ${targetEmail} not found. Please create this user first via the app UI.`);
      process.exit(1);
    }
    const userId = user._id;
    console.log(`👤 Found user: ${user.email}`);

    // 2. Wipe old routine and history for this user
    console.log('🧹 Wiping old schedules and workout history...');
    await WeeklySchedule.deleteMany({ userId });
    await Workout.deleteMany({ userId });

    // 3. Insert Master Blueprint
    console.log('📝 Seeding Weekly Blueprint...');
    await WeeklySchedule.create({
      userId,
      days: masterRoutine
    });

    // 4. Generate 30 Days of Historical Data
    console.log('⏳ Generating 30 days of historical workout data...');
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight

    const historyPromises = [];
    
    // Helper to get random number between min/max
    const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    for (let i = 30; i >= 1; i--) {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - i);
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[pastDate.getDay()];
      
      const dailyRoutine = masterRoutine.find(d => d.dayName === dayName);
      
      // Simulate an 85% attendance rate for non-rest days
      const attended = dailyRoutine.isRestDay ? true : Math.random() > 0.15; 
      
      // Build the exercises for the historical record
      const loggedExercises = dailyRoutine.exercises.map(ex => {
        const sets = [];
        // If attended, generate random completed sets based on target
        if (attended && !dailyRoutine.isRestDay) {
          for (let s = 1; s <= ex.setsCount; s++) {
            sets.push({
              setNumber: s,
              reps: getRandom(8, 15), // Random reps for history
              weight: getRandom(15, 60), // Random weight (kg) for history volume
            });
          }
        }
        
        return {
          _id: new mongoose.Types.ObjectId(),
          name: ex.name,
          targetReps: ex.targetReps,
          status: attended ? 'completed' : 'pending',
          sets: sets
        };
      });

      const workoutDoc = {
        userId,
        date: pastDate,
        dayName: dayName,
        muscleGroup: dailyRoutine.muscleGroup,
        isRestDay: dailyRoutine.isRestDay,
        attended: attended,
        exercises: loggedExercises
      };

      historyPromises.push(Workout.create(workoutDoc));
    }

    await Promise.all(historyPromises);
    console.log(`✅ Successfully seeded 30 historical workouts.`);

    console.log('\n🚀 SEEDING COMPLETE! Your database is fresh and ready for tomorrow.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();