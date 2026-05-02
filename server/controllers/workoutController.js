const Workout = require('../models/Workout');
const WeeklySchedule = require('../models/WeeklySchedule');

exports.getTodayWorkout = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Define the time boundaries for "Today" (Local Time)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 2. Check if a workout instance already exists for this specific date
    let workout = await Workout.findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    // 3. If it exists, return it immediately
    if (workout) {
      return res.status(200).json({ data: workout });
    }

    // 4. If not, we need to initialize it from the WeeklySchedule (The Blueprint)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNames[new Date().getDay()];

    const userSchedule = await WeeklySchedule.findOne({ userId });
    
    if (!userSchedule) {
      return res.status(404).json({ message: "No weekly schedule found. Please set up your plan in settings." });
    }

    // Find the specific plan for today from the schedule
    const dayPlan = userSchedule.days.find(d => d.dayName === currentDayName);

    if (!dayPlan) {
      return res.status(404).json({ message: `No plan found for ${currentDayName}` });
    }

    // 5. Create the "Instance" of today's workout
    const newWorkout = await Workout.create({
      userId,
      date: new Date(),
      dayName: currentDayName,
      muscleGroup: dayPlan.muscleGroup,
      isRestDay: dayPlan.isRestDay,
      attended: false,
      exercises: dayPlan.exercises.map((ex, index) => ({
        name: ex.name,
        description: ex.description,
        imageUrl: ex.imageUrl,
        order: index,
        status: 'pending',
        sets: Array.from({ length: ex.setsCount }, () => ({
          reps: parseInt(ex.targetReps) || 0,
          weight: 0,
          isCompleted: false
        }))
      }))
    });

    res.status(201).json({ data: newWorkout });

  } catch (error) {
    console.error("Initialization Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE: Remove an exercise from today's workout instance
exports.deleteExercise = async (req, res) => {
  const { workoutId, exerciseId } = req.params;

  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: workoutId, userId: req.user.id },
      { $pull: { exercises: { _id: exerciseId } } },
      { returnDocument: 'after' }
    );

    if (!workout) return res.status(404).json({ message: "Workout not found or unauthorized" });

    res.status(200).json({ data: workout });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH: Update Exercise Status (Swipe logic)
exports.updateExercise = async (req, res) => {
  const { workoutId, exerciseId } = req.params;
  const { status } = req.body;

  try {
    const workout = await Workout.findOneAndUpdate(
      { 
        _id: workoutId, 
        userId: req.user.id, // Security boundary
        "exercises._id": exerciseId 
      },
      { $set: { "exercises.$.status": status } },
      { returnDocument: 'after' }
    );

    if (!workout) return res.status(404).json({ message: "Workout/Exercise not found or unauthorized." });

    res.status(200).json({ data: workout });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH: Update Sets and Reps (Inline Debounced Editing)
exports.updateExerciseSets = async (req, res) => {
  const { workoutId, exerciseId } = req.params;
  const { sets } = req.body;

  try {
    const workout = await Workout.findOneAndUpdate(
      { 
        _id: workoutId, 
        userId: req.user.id, // Security boundary
        "exercises._id": exerciseId 
      },
      { $set: { "exercises.$.sets": sets } },
      { returnDocument: 'after' }
    );

    if (!workout) return res.status(404).json({ message: "Workout/Exercise not found or unauthorized." });

    res.status(200).json({ data: workout });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST: Add Custom Exercise
exports.addExercise = async (req, res) => {
  const { workoutId } = req.params;
  const newExerciseData = req.body;

  try {
    // Ensure the workout belongs to the user before modifying it
    const workout = await Workout.findOne({ _id: workoutId, userId: req.user.id });
    
    if (!workout) return res.status(404).json({ message: "Workout not found or unauthorized" });

    newExerciseData.order = workout.exercises.length;
    newExerciseData.status = 'pending';

    workout.exercises.push(newExerciseData);
    await workout.save();

    const addedExercise = workout.exercises[workout.exercises.length - 1];
    res.status(201).json({ data: addedExercise });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH: Toggle Attendance
exports.toggleAttendance = async (req, res) => {
  const { workoutId } = req.params;
  const { attended } = req.body;
  
  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: workoutId, userId: req.user.id }, // Security boundary
      { $set: { attended } }, 
      { returnDocument: 'after' }
    );

    if (!workout) return res.status(404).json({ message: "Workout not found or unauthorized." });

    res.status(200).json({ data: workout });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET: /api/workouts/history
exports.getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15; // Updated to 15 as requested
    const skip = (page - 1) * limit;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const workouts = await Workout.find({
      userId: req.user.id,
      date: { $lt: todayStart }
    })
    .sort({ date: -1 }) 
    .skip(skip)
    .limit(limit);

    const total = await Workout.countDocuments({ 
      userId: req.user.id, 
      date: { $lt: todayStart } 
    });

    res.status(200).json({
      data: workouts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit) // Helper flag for frontend
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET: /api/workouts/calendar-stats?month=4&year=2026
exports.getCalendarStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    // Create date range for the requested month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, parseInt(month) + 1, 0, 23, 59, 59);

    const workouts = await Workout.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).select('date attended isRestDay exercises.status'); // Fetch only status indicators

    const stats = workouts.map(w => ({
      _id: w._id,
      date: w.date,
      isRestDay: w.isRestDay,
      // Derived status: Attended if at least one exercise isn't 'pending'
      status: w.isRestDay ? 'rest' : (w.exercises.some(ex => ex.status !== 'pending') ? 'attended' : 'missed')
    }));

    res.status(200).json({ data: stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET: /api/workouts/history/:id
exports.getWorkoutDetail = async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, userId: req.user.id });
    if (!workout) return res.status(404).json({ message: "Workout log not found" });
    res.status(200).json({ data: workout });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
