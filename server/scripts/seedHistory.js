const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');
const WeeklySchedule = require('../models/WeeklySchedule');
const Workout = require('../models/Workout');

const seedHistory = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error("MONGODB_URI not found in .env");

        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB Atlas');

        const emailToSeed = 'test@gmail.com';
        const user = await User.findOne({ email: emailToSeed });

        if (!user) {
            console.error(`❌ User ${emailToSeed} not found.`);
            process.exit(1);
        }

        const schedule = await WeeklySchedule.findOne({ userId: user._id });
        if (!schedule) {
            console.error(`❌ No weekly schedule found for ${user._id}`);
            process.exit(1);
        }

        console.log('🧹 Clearing old history...');
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        await Workout.deleteMany({ userId: user._id, date: { $lt: todayStart } });

        const workoutsToInsert = [];

        for (let i = 1; i <= 30; i++) {
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() - i);
            targetDate.setHours(0, 0, 0, 0);

            const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });
            const dayTemplate = schedule.days.find(d => d.dayName === dayName);
            if (!dayTemplate) continue;

            const isRestDay = dayTemplate.isRestDay;

            // Simulate: 20% chance of missing the gym entirely (all pending)
            const missedGymEntirely = !isRestDay && Math.random() < 0.20;

            const simulatedExercises = (dayTemplate.exercises || []).map(ex => {
                let status = 'pending';

                if (!isRestDay && !missedGymEntirely) {
                    // If they went to the gym, 90% chance they did the exercise
                    status = Math.random() > 0.1 ? 'completed' : 'skipped';
                }

                const sets = Array.from({ length: ex.setsCount || 3 }).map(() => ({
                    weight: status === 'completed' ? Math.floor(Math.random() * 10) * 5 + 20 : 0,
                    reps: status === 'completed' ? (parseInt(ex.targetReps) || 10) : 0,
                    isCompleted: status === 'completed'
                }));

                return { name: ex.name, status, sets };
            });

            // NEW LOGIC: Attended is true if at least one exercise is not 'pending'
            const hasActivity = simulatedExercises.some(ex => ex.status !== 'pending');

            workoutsToInsert.push({
                userId: user._id,
                date: targetDate,
                dayName: dayTemplate.dayName,
                muscleGroup: dayTemplate.muscleGroup,
                isRestDay,
                exercises: simulatedExercises,
                attended: isRestDay ? false : hasActivity // Mark attended if any activity exists
            });
        }

        await Workout.insertMany(workoutsToInsert);
        console.log(`✅ Successfully seeded 30 days of history for ${emailToSeed}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedHistory();