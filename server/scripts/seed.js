require('dotenv').config();
const mongoose = require('mongoose');
const Workout = require('../models/Workout');

const weeklyPlan = [
  {
    dayName: 'Monday',
    muscleGroup: 'Back + Biceps',
    isRestDay: false,
    exercises: [
      { name: 'Assisted Pull-Ups', setsCount: 3, targetReps: '6-10', description: 'Focus on pulling your elbows down to your hips. Squeeze the lats at the bottom.' },
      { name: 'Lat Pulldown', setsCount: 3, targetReps: '10', description: 'Keep your chest up and lean slightly back. Pull the bar to your upper chest.' },
      { name: 'Seated Cable Row', setsCount: 3, targetReps: '10', description: 'Keep your back straight and pull the handle to your abdomen. Retract your scapula.' },
      { name: 'One-arm Dumbbell Row', setsCount: 3, targetReps: '10', description: 'Support your body on a bench. Pull the dumbbell to your hip, keeping the elbow tucked.' },
      { name: 'Straight Arm Pulldown', setsCount: 3, targetReps: '12', description: 'Use a rope or straight bar. Keep arms mostly straight and push down using your lats.' },
      { name: 'Dumbbell Curl', setsCount: 3, targetReps: '12', description: 'Supinate (turn outward) your wrists as you curl up for maximum bicep contraction.' },
      { name: 'Hammer Curl', setsCount: 3, targetReps: '12', description: 'Keep palms facing each other. Targets the brachialis and brachioradialis.' },
    ]
  },
  {
    dayName: 'Tuesday',
    muscleGroup: 'Chest + Triceps',
    isRestDay: false,
    exercises: [
      { name: 'Bench Press', setsCount: 3, targetReps: '8-10', description: 'Plant your feet firmly. Lower the bar to your mid-chest and push up explosively.' },
      { name: 'Incline Dumbbell Press', setsCount: 3, targetReps: '10', description: 'Set bench to 30-45 degrees. Focus on the upper chest. Don\'t lock elbows at the top.' },
      { name: 'Pec Deck / Cable Fly', setsCount: 3, targetReps: '12', description: 'Maintain a slight bend in your elbows. Imagine hugging a large tree.' },
      { name: 'Pushups', setsCount: 2, targetReps: 'Failure', description: 'Keep your core tight and body in a straight line. Go as deep as your mobility allows.' },
      { name: 'Rope Pushdown', setsCount: 3, targetReps: '12', description: 'Keep elbows glued to your sides. Spread the rope at the bottom of the movement.' },
      { name: 'Overhead Dumbbell Extension', setsCount: 3, targetReps: '12', description: 'Keep your upper arms stationary next to your head. Stretch the triceps at the bottom.' },
    ]
  },
  { dayName: 'Wednesday', muscleGroup: 'Rest / Recovery', isRestDay: true, exercises: [] },
  {
    dayName: 'Thursday',
    muscleGroup: 'Legs',
    isRestDay: false,
    exercises: [
      { name: 'Squats', setsCount: 3, targetReps: '10', description: 'Keep your chest up and core braced. Break at the hips and knees simultaneously.' },
      { name: 'Leg Press', setsCount: 3, targetReps: '10', description: 'Place feet shoulder-width apart. Do not lock your knees out at the top of the movement.' },
      { name: 'Leg Extension', setsCount: 3, targetReps: '12', description: 'Squeeze the quads hard at the top. Control the weight on the way down.' },
      { name: 'Leg Curl', setsCount: 3, targetReps: '12', description: 'Keep your hips pressed firmly into the pad. Curl the weight using only your hamstrings.' },
      { name: 'Standing Calf Raises', setsCount: 3, targetReps: '15', description: 'Get a deep stretch at the bottom and pause for a second at the top contraction.' },
    ]
  },
  {
    dayName: 'Friday',
    muscleGroup: 'Shoulders + Abs',
    isRestDay: false,
    exercises: [
      { name: 'Dumbbell Shoulder Press', setsCount: 3, targetReps: '10', description: 'Keep elbows slightly in front of your body, not flared directly to the sides.' },
      { name: 'Lateral Raises', setsCount: 3, targetReps: '12', description: 'Lead with your elbows. Imagine pouring water out of pitchers at the top.' },
      { name: 'Front Raises', setsCount: 3, targetReps: '12', description: 'Use a controlled tempo. Raise the dumbbells to shoulder height.' },
      { name: 'Rear Delt Fly', setsCount: 3, targetReps: '12', description: 'Bend over with a flat back. Focus on pulling apart with your rear deltoids.' },
      { name: 'Plank', setsCount: 3, targetReps: '30-45s', description: 'Keep your body in a straight line. Squeeze your glutes and brace your core.' },
      { name: 'Leg Raises', setsCount: 3, targetReps: '15', description: 'Control the descent. Avoid using momentum to swing your legs up.' },
    ]
  },
  {
    dayName: 'Saturday',
    muscleGroup: 'Arms + Cardio',
    isRestDay: false,
    exercises: [
      { name: 'Barbell Curl', setsCount: 3, targetReps: '10', description: 'Keep your elbows pinned to your sides. Avoid swinging your torso.' },
      { name: 'Concentration Curl', setsCount: 3, targetReps: '12', description: 'Rest your elbow on your inner thigh. Focus entirely on the bicep contraction.' },
      { name: 'Skull Crushers', setsCount: 3, targetReps: '10', description: 'Lower the bar to your forehead or slightly behind. Keep elbows pointing toward the ceiling.' },
      { name: 'Tricep Pushdown', setsCount: 3, targetReps: '12', description: 'Use a straight bar or V-bar. Lock out your triceps at the bottom.' },
      { name: 'Incline Walking', setsCount: 1, targetReps: '10-15m', description: 'Set treadmill to 10-15% incline and walk at a brisk pace for steady-state cardio.' },
    ]
  },
  { dayName: 'Sunday', muscleGroup: 'Full Rest', isRestDay: true, exercises: [] },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Workout.deleteMany({}); 

    const processedWorkouts = weeklyPlan.map(day => ({
      userId: "demo-user-123",
      dayName: day.dayName,
      muscleGroup: day.muscleGroup,
      isRestDay: day.isRestDay,
      attended: false,
      date: new Date(), 
      exercises: day.exercises.map((ex, index) => ({
        name: ex.name,
        description: ex.description || '',
        imageUrl: '', // Left empty for future S3 integration
        order: index,
        status: 'pending',
        sets: Array.from({ length: ex.setsCount }, () => ({
          reps: parseInt(ex.targetReps) || 0,
          weight: 0,
          isCompleted: false
        }))
      }))
    }));

    await Workout.insertMany(processedWorkouts);
    console.log("✅ RepLog Weekly Plan Seeded Successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
};

seedDB();