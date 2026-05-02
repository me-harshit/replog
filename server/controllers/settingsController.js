const User = require('../models/User');
const WeeklySchedule = require('../models/WeeklySchedule');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require('path');

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// GET: /api/settings/profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json({ data: user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PATCH: /api/settings/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, profile } = req.body;

        // Build update object dynamically
        const updateData = {};
        if (name) updateData.name = name;

        // Check for dob instead of age
        if (profile?.dob) updateData["profile.dob"] = profile.dob;
        if (profile?.height) updateData["profile.height"] = profile.height;
        if (profile?.weight) updateData["profile.weight"] = profile.weight;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { returnDocument: 'after' }
        ).select('-password');

        res.status(200).json({ data: user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.uploadAvatar = async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ message: "No file uploaded" });

        const user = await User.findById(req.user.id);

        // Sanitize user name for S3 path (e.g., "John Doe" -> "john-doe")
        const safeName = user.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const ext = path.extname(file.originalname);
        const fileName = `RepLog/${safeName}/avatar-${Date.now()}${ext}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
        });

        await s3.send(command);

        // Construct the public S3 URL
        const avatarUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

        // Update user profile
        user.profile.avatarUrl = avatarUrl;
        await user.save();

        res.status(200).json({ data: user, avatarUrl });
    } catch (error) {
        console.error("S3 Upload Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// POST: /api/settings/blueprint/:dayName/exercises/:exerciseId/image
exports.uploadExerciseImage = async (req, res) => {
  try {
    const { dayName, exerciseId } = req.params;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user.id);
    
    // Sanitize user name for S3 path
    const safeName = user.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const ext = path.extname(file.originalname);
    const fileName = `RepLog/${safeName}/exercises/${exerciseId}-${Date.now()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3.send(command);
    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // Update the specific exercise in the database
    const schedule = await WeeklySchedule.findOne({ userId: req.user.id });
    const day = schedule.days.find(d => d.dayName === dayName);
    const exercise = day.exercises.id(exerciseId);
    
    if (exercise) {
      exercise.imageUrl = imageUrl;
      await schedule.save();
    }

    res.status(200).json({ data: schedule, imageUrl });
  } catch (error) {
    console.error("S3 Exercise Upload Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET: /api/settings/blueprint
exports.getBlueprint = async (req, res) => {
    try {
        const schedule = await WeeklySchedule.findOne({ userId: req.user.id });
        res.status(200).json({ data: schedule });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PATCH: /api/settings/blueprint/:dayName
exports.updateDailyBlueprint = async (req, res) => {
    try {
        const { dayName } = req.params;
        const { muscleGroup, isRestDay } = req.body;

        const schedule = await WeeklySchedule.findOneAndUpdate(
            { userId: req.user.id, "days.dayName": dayName },
            {
                $set: {
                    "days.$.muscleGroup": muscleGroup,
                    "days.$.isRestDay": isRestDay
                }
            },
            { returnDocument: 'after' }
        );

        res.status(200).json({ data: schedule });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST: /api/settings/blueprint/:dayName/exercises
exports.addBlueprintExercise = async (req, res) => {
    try {
        const { dayName } = req.params;
        const schedule = await WeeklySchedule.findOne({ userId: req.user.id });
        const day = schedule.days.find(d => d.dayName === dayName);

        if (!day) return res.status(404).json({ message: "Day not found" });

        const newExercise = {
            name: 'New Exercise',
            description: '',
            imageUrl: '',
            setsCount: 3,
            targetReps: '10-12'
        };

        day.exercises.push(newExercise);
        await schedule.save();

        res.status(201).json({ data: schedule });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PATCH: /api/settings/blueprint/:dayName/exercises/:exerciseId
exports.updateBlueprintExercise = async (req, res) => {
    try {
        const { dayName, exerciseId } = req.params;
        const updates = req.body; // e.g., { name: "Bench Press", setsCount: 4 }

        const schedule = await WeeklySchedule.findOne({ userId: req.user.id });
        const day = schedule.days.find(d => d.dayName === dayName);
        const exercise = day.exercises.id(exerciseId);

        if (!exercise) return res.status(404).json({ message: "Exercise not found" });

        // Apply updates dynamically
        Object.keys(updates).forEach(key => {
            exercise[key] = updates[key];
        });

        await schedule.save();
        res.status(200).json({ data: schedule });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE: /api/settings/blueprint/:dayName/exercises/:exerciseId
exports.deleteBlueprintExercise = async (req, res) => {
    try {
        const { dayName, exerciseId } = req.params;

        const schedule = await WeeklySchedule.findOne({ userId: req.user.id });
        const day = schedule.days.find(d => d.dayName === dayName);

        day.exercises.pull(exerciseId); // Mongoose helper to remove subdoc
        await schedule.save();

        res.status(200).json({ data: schedule });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};