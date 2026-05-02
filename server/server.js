require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

const workoutRoutes = require('./routes/workoutRoutes');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

connectDB();

// 2. Strict CORS Configuration (Only define this ONCE)
app.use(cors({
    origin: ['http://localhost:5173', 'https://replog-app.onrender.com'], 
    credentials: true
}));

// 3. Security & Parsing Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json()); 

// 4. Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

// Health check route
app.get('/', (req, res) => res.send('RepLog API Running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));