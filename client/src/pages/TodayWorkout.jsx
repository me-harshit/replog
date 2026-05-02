import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Dumbbell, Trophy, CalendarCheck, Undo2, ArrowRight, ArrowLeft } from 'lucide-react';
import useStore from '../store/useStore';
import ExerciseCard from '../components/exercise/ExerciseCard'; 
import ProgressBar from '../components/common/ProgressBar';
import { SkeletonExercise } from '../components/common/Skeleton';
import AddExerciseForm from '../components/exercise/AddExerciseForm';

export default function TodayWorkout() {
  const { todayWorkout, fetchToday, isLoadingToday, toggleAttendance, updateExerciseStatus } = useStore();
  
  const [expandedExerciseId, setExpandedExerciseId] = useState(null);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  if (isLoadingToday) {
    return (
      <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto space-y-4">
        <div className="skeleton h-32 rounded-2xl mb-6" />
        {[...Array(5)].map((_, i) => <SkeletonExercise key={i} />)}
      </div>
    );
  }

  if (!todayWorkout) {
    return (
      <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto text-center pt-32">
        <Dumbbell size={48} className="mx-auto text-app-border mb-4" />
        <p className="text-text-secondary text-lg">No workout found for today.</p>
        <p className="text-xs text-text-secondary mt-2">Check your settings to initialize the week.</p>
      </div>
    );
  }

  // --- NEW: Auto-Attendance Logic ---
  const handleAutoAttendance = () => {
    // Only fire the API call if they haven't already been marked as attended
    if (!todayWorkout.attended && !todayWorkout.isRestDay) {
      toggleAttendance(todayWorkout._id, true);
    }
  };

  const pendingExercises = todayWorkout.exercises.filter(e => e.status === 'pending');
  const swipedExercises = todayWorkout.exercises.filter(e => e.status !== 'pending');

  const completed = todayWorkout.exercises.filter(e => e.status === 'completed').length;
  const skipped = todayWorkout.exercises.filter(e => e.status === 'skipped').length;
  const total = todayWorkout.exercises.length;

  const handleRestore = (exerciseId) => {
    updateExerciseStatus(todayWorkout._id, exerciseId, { status: 'pending' });
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto space-y-5 pb-24">

      {/* Day Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 relative overflow-hidden shadow-lg"
      >
        <div className="absolute inset-0 bg-gradient-brand opacity-[0.03] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">Today's Session</p>
              <h2 className="font-extrabold text-3xl text-gradient tracking-tight">
                {todayWorkout.dayName.toUpperCase()}
              </h2>
              <p className="text-brand-accent text-sm font-medium mt-1">{todayWorkout.muscleGroup}</p>
            </div>

            {/* Attendance Toggle */}
            {!todayWorkout.isRestDay && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleAttendance(todayWorkout._id, !todayWorkout.attended)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm ${
                  todayWorkout.attended
                    ? 'bg-status-success/10 text-status-success border border-status-success/30 glow-success'
                    : 'bg-app-card text-text-secondary hover:text-text-primary border border-app-border hover:border-brand-orange'
                }`}
              >
                <CalendarCheck size={16} />
                {todayWorkout.attended ? 'Attended' : 'Log Attendance'}
              </motion.button>
            )}
          </div>

          {/* Progress Section */}
          {!todayWorkout.isRestDay && (
            <div className="mt-6 space-y-3">
              <ProgressBar value={completed + skipped} max={total} />
              <div className="flex gap-4 text-xs font-medium">
                <span className="flex items-center gap-1 text-status-success">
                  <CheckCircle2 size={12} /> {completed} Done
                </span>
                <span className="flex items-center gap-1 text-status-danger">
                  <XCircle size={12} /> {skipped} Skipped
                </span>
                <span className="text-text-secondary ml-auto">
                  {pendingExercises.length} Remaining
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Swipe Hint */}
      {!todayWorkout.isRestDay && pendingExercises.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center items-center gap-4 text-[11px] font-bold text-text-secondary uppercase tracking-wider py-2 bg-app-card/30 rounded-xl border border-app-border/50"
        >
          <span className="flex items-center gap-1.5 text-status-danger/80">
            <ArrowLeft size={14} /> Swipe Skip
          </span>
          <div className="w-1 h-1 rounded-full bg-app-border" />
          <span className="flex items-center gap-1.5 text-status-success/80">
            Swipe Done <ArrowRight size={14} />
          </span>
        </motion.div>
      )}

      {/* Pending Exercises List */}
      <div className="space-y-4">
        <AnimatePresence>
          {pendingExercises.map((exercise) => (
            <ExerciseCard
              key={exercise._id}
              exercise={exercise}
              workoutId={todayWorkout._id}
              onSwipe={(exId, status) => {
                updateExerciseStatus(todayWorkout._id, exId, { status });
                // NEW: If swiped right (completed), automatically mark attendance
                if (status === 'completed') handleAutoAttendance();
              }}
              // NEW: Pass the handler down so editing sets also triggers attendance
              onActivity={handleAutoAttendance}
              isExpanded={expandedExerciseId === exercise._id}
              onToggle={() => setExpandedExerciseId(
                expandedExerciseId === exercise._id ? null : exercise._id
              )}
            />
          ))}
        </AnimatePresence>
      </div>

      {!todayWorkout.isRestDay && (
        <div className="pt-2">
          <AddExerciseForm dayId={todayWorkout._id} />
        </div>
      )}

      {/* Completion Celebration */}
      {pendingExercises.length === 0 && total > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="card p-8 text-center border-status-success/30 glow-success mt-8"
        >
          <Trophy size={48} className="mx-auto text-brand-orange mb-3" />
          <p className="font-extrabold text-2xl text-gradient tracking-tight">SESSION COMPLETE!</p>
          <p className="text-text-secondary text-sm mt-2 font-medium">You finished your list for today. Great work! 🔥</p>
        </motion.div>
      )}

      {/* Swiped Exercises (Restore Section) */}
      {swipedExercises.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 pt-8 border-t border-app-border"
        >
          <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-4 px-2">
            Completed & Skipped
          </h3>
          <div className="space-y-2">
            <AnimatePresence>
              {swipedExercises.map((ex) => (
                <motion.div
                  key={ex._id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between p-4 bg-app-card/30 border border-app-border rounded-xl backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    {ex.status === 'completed' ? (
                      <CheckCircle2 className="text-status-success" size={18} />
                    ) : (
                      <XCircle className="text-status-danger" size={18} />
                    )}
                    <span className={`text-sm font-semibold ${ex.status === 'skipped' ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                      {ex.name}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRestore(ex._id)} 
                    className="p-2 -mr-2 text-text-secondary hover:text-brand-orange transition-colors rounded-lg hover:bg-app-bg"
                    title="Restore to active list"
                  >
                    <Undo2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}