# ⚡ RepLog

> **A premium, frictionless workout tracker built for the modern athlete.**

RepLog is a full-stack MERN application engineered to remove the friction from gym logging. Featuring a "Zero-Save-Button" architecture, fluid swipe-to-log mechanics, and a deeply customizable weekly blueprint, it is designed to feel like a high-end native iOS application operating directly in your browser.

<p align="center">
  <img src="https://gts-dash.s3.ap-south-1.amazonaws.com/AppImages/Dashboard.jpeg" alt="Dashboard Preview" width="300" style="border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.5);">
</p>

## ✨ Core Philosophy & Features

*   🔥 **Zero-Friction UI:** Absolute absence of "Save" buttons. Every text input, toggle, and slider auto-saves directly to MongoDB instantly via optimistic UI updates.
*   📱 **Swipe-to-Log Gestures:** Fluid, intuitive swipe mechanics for individual exercises. Swipe Right to mark as DONE, Swipe Left to mark as SKIPPED.
*   🧠 **Dynamic Weekly Blueprint:** A fully customizable master schedule. Designate rest days, define muscle groups, and build custom exercise arrays that auto-populate your daily sessions.
*   📊 **Deep Analytics Engine:** Server-side MongoDB aggregations power rich, responsive charts. Track total volume, consistency streaks, and muscle group distribution.
*   🎨 **Premium Design System:** Dark-mode exclusive, utilizing glassmorphism, soft shadows, and a bespoke `#ff3b3b` to `#ff7a18` gradient aesthetic.

## 📸 Platform Interface

### The Daily Grind (Today's Workout)
Swipe right to crush a set, swipe left to skip. Instant, satisfying feedback.
<p align="center">
  <img src="https://gts-dash.s3.ap-south-1.amazonaws.com/AppImages/Today.jpeg" alt="Today's Workout" width="300">
</p>

### Performance Analytics (Reports)
Visualize your consistency, total volume lifted, and muscle splits over time.
<p align="center">
  <img src="https://gts-dash.s3.ap-south-1.amazonaws.com/AppImages/Reports.jpeg" alt="Reports & Analytics" width="300">
</p>

### Training Log (History)
A complete calendar and chronological breakdown of your entire fitness journey.
<p align="center">
  <img src="https://gts-dash.s3.ap-south-1.amazonaws.com/AppImages/History.jpeg" alt="History Log" width="300">
</p>

### Identity & Metrics (Profile Settings)
Manage your physical profile, dynamically calculate BMI, and upload avatar assets directly to AWS S3.
<p align="center">
  <img src="https://gts-dash.s3.ap-south-1.amazonaws.com/AppImages/Settings-Profile.jpeg" alt="Profile Settings" width="300">
</p>

### The Master Routine (Workout Blueprint)
Your central nervous system. Define your splits for the week, and the app will generate your daily workouts automatically.
<p align="center">
  <img src="https://gts-dash.s3.ap-south-1.amazonaws.com/AppImages/Settings-Workout.jpeg" alt="Workout Blueprint" width="300">
</p>

## 🛠️ Tech Stack Architecture

**Frontend (Client)**
*   **Core:** React.js (Vite)
*   **Styling:** Tailwind CSS (Dark theme, Glassmorphism)
*   **Motion:** Framer Motion (Gestures, layout animations)
*   **Visuals:** Recharts (Data), Lucide React (Icons)
*   **State & API:** Axios, React Hooks

**Backend (Server)**
*   **Core:** Node.js, Express.js
*   **Database:** MongoDB Atlas, Mongoose ODM
*   **Security:** JWT Auth, Bcryptjs, Helmet, Express-Rate-Limit
*   **Media Pipeline:** AWS SDK v3, Multer (Memory-storage to S3)

## 🎨 Design System

RepLog strictly adheres to a modern gym aesthetic:
*   **Background:** `#0f0f0f`
*   **Surface/Cards:** `#181818`
*   **Primary Gradient:** `linear-gradient(135deg, #ff3b3b, #ff7a18)`
*   **Success:** `#22c55e`
*   **Danger:** `#ef4444`

## 🚀 Local Setup & Installation

### 1. Repository Initialization
```bash
git clone [https://github.com/yourusername/replog.git](https://github.com/yourusername/replog.git)
cd replog


### 2. Backend Infrastructure
```bash
cd server
npm install

