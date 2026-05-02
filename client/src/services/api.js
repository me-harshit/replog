import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API = axios.create({
  baseURL: API_URL,
});

// Intercept requests and attach the JWT token if it exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('replog_token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
}, (error) => {
  return Promise.reject(error);
});

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getProfile: () => API.get('/auth/me'),
};

export const workoutDayAPI = {
  getToday: () => API.get('/workouts/today'),
  updateExercise: (dayId, exerciseId, data) => API.patch(`/workouts/${dayId}/exercise/${exerciseId}`, data),
  updateSetsReps: (dayId, exerciseId, data) => API.patch(`/workouts/${dayId}/exercise/${exerciseId}/sets`, data),
  addExercise: (dayId, data) => API.post(`/workouts/${dayId}/exercises`, data),
  getHistory: (page = 1) => API.get(`/workouts/history?page=${page}`),
  getCalendarStats: (month, year) => API.get(`/workouts/calendar-stats?month=${month}&year=${year}`),
  getWorkoutDetail: (id) => API.get(`/workouts/history/${id}`),
  
  deleteExercise: (dayId, exerciseId) => API.delete(`/workouts/${dayId}/exercise/${exerciseId}`),
  
  toggleAttendance: (dayId, data) => API.patch(`/workouts/${dayId}/attendance`, data),
};

export const reportAPI = {
  weekly: () => API.get('/reports/weekly'),
  monthly: () => API.get('/reports/monthly'),
  allTime: () => API.get('/reports/all-time'),
  streak: () => API.get('/reports/streak'),
};

export const settingsAPI = {
  getProfile: () => API.get('/settings/profile'),
  updateProfile: (data) => API.patch('/settings/profile', data),
  
  // NEW: Avatar upload
  uploadAvatar: (formData) => API.post('/settings/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Blueprint routes...
  getBlueprint: () => API.get('/settings/blueprint'),
  updateDailyBlueprint: (dayName, data) => API.patch(`/settings/blueprint/${dayName}`, data),
  addBlueprintExercise: (dayName) => API.post(`/settings/blueprint/${dayName}/exercises`),
  updateBlueprintExercise: (dayName, exId, data) => API.patch(`/settings/blueprint/${dayName}/exercises/${exId}`, data),
  deleteBlueprintExercise: (dayName, exId) => API.delete(`/settings/blueprint/${dayName}/exercises/${exId}`),
  uploadExerciseImage: (dayName, exId, formData) => API.post(`/settings/blueprint/${dayName}/exercises/${exId}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};