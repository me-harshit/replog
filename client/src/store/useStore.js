import { create } from 'zustand';
import { workoutDayAPI } from '../services/api';
import toast from 'react-hot-toast';

const useStore = create((set, get) => ({
  todayWorkout: null,
  isLoadingToday: true,
  error: null,

  // 1. Initial Load
  fetchToday: async () => {
    set({ isLoadingToday: true });
    try {
      const res = await workoutDayAPI.getToday();
      set({ todayWorkout: res.data.data, error: null });
    } catch (error) {
      console.error('Fetch today error:', error);
      set({ error: 'Failed to load workout' });
    } finally {
      set({ isLoadingToday: false });
    }
  },

  // 2. Swipe Actions (Optimistic)
  updateExerciseStatus: async (dayId, exerciseId, statusUpdates) => {
    const previousWorkout = get().todayWorkout;

    // Optimistic UI Update: Instant feedback
    set((state) => ({
      todayWorkout: {
        ...state.todayWorkout,
        exercises: state.todayWorkout.exercises.map((ex) =>
          ex._id === exerciseId ? { ...ex, ...statusUpdates } : ex
        ),
      },
    }));

    // Background API Sync
    try {
      await workoutDayAPI.updateExercise(dayId, exerciseId, statusUpdates);
    } catch (error) {
      // Rollback on failure
      set({ todayWorkout: previousWorkout });
      toast.error('Connection lost. Reverting changes.', {
        style: { background: '#181818', color: '#f5f5f5', border: '1px solid #ef4444' }
      });
    }
  },

  // 3. Inline Editing (Designed to be called inside a debounce)
  updateSetsReps: async (dayId, exerciseId, setUpdates) => {
    const previousWorkout = get().todayWorkout;

    set((state) => ({
      todayWorkout: {
        ...state.todayWorkout,
        exercises: state.todayWorkout.exercises.map((ex) =>
          ex._id === exerciseId ? { ...ex, ...setUpdates } : ex
        ),
      },
    }));

    try {
      await workoutDayAPI.updateSetsReps(dayId, exerciseId, setUpdates);
    } catch (error) {
      set({ todayWorkout: previousWorkout });
      toast.error('Failed to save reps. Reverting.');
    }
  },

  // 4. Add Exercise
  addExercise: async (dayId, exerciseData) => {
    try {
      const res = await workoutDayAPI.addExercise(dayId, exerciseData);
      // Backend returns the newly created exercise object with its MongoDB _id
      const newExercise = res.data.data; 
      
      set((state) => ({
        todayWorkout: {
          ...state.todayWorkout,
          exercises: [...state.todayWorkout.exercises, newExercise],
        },
      }));
      toast.success('Exercise added!', {
        style: { background: '#181818', color: '#22c55e', border: '1px solid #22c55e' }
      });
    } catch (error) {
      toast.error('Failed to add exercise');
    }
  },

  deleteExercise: async (workoutId, exerciseId) => {
    const currentWorkout = get().todayWorkout;
    
    // Optimistic UI: Filter out the exercise immediately
    set({
      todayWorkout: {
        ...currentWorkout,
        exercises: currentWorkout.exercises.filter(ex => ex._id !== exerciseId)
      }
    });

    try {
      await workoutDayAPI.deleteExercise(workoutId, exerciseId);
      toast.success("Exercise removed from today's list");
    } catch (error) {
      set({ todayWorkout: currentWorkout }); // Rollback
      toast.error("Failed to delete exercise");
    }
  },

  // 6. Day Attendance (Optimistic)
  toggleAttendance: async (dayId, attended) => {
    const previousWorkout = get().todayWorkout;

    set((state) => ({
      todayWorkout: {
        ...state.todayWorkout,
        attended,
      },
    }));

    try {
      await workoutDayAPI.toggleAttendance(dayId, { attended });
    } catch (error) {
      set({ todayWorkout: previousWorkout });
      toast.error('Failed to update attendance.');
    }
  },
}));

export default useStore;