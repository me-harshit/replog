import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Flame, Activity, CheckCircle2, Target, CalendarCheck, Dumbbell, ChevronRight } from 'lucide-react';
import useStore from '../store/useStore';
import { reportAPI } from '../services/api';
import useAuthStore from '../store/useAuthStore';

// Constants aligning with the master plan
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEK_SPLITS = ['Back+Biceps', 'Chest+Triceps', 'Rest', 'Legs', 'Shoulders+Abs', 'Arms+Cardio', 'Rest'];

function StatCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-2">
        <p className="text-text-secondary text-[10px] uppercase tracking-widest font-bold">{label}</p>
        <Icon size={16} className={accent ? "text-brand-orange" : "text-text-secondary/50"} />
      </div>
      <p className={`font-extrabold text-3xl tracking-tight ${accent ? 'text-gradient' : 'text-text-primary'}`}>
        {value}
      </p>
      {sub && <p className="text-text-secondary text-xs mt-1 font-medium">{sub}</p>}
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const { todayWorkout, isLoadingToday, fetchToday, toggleAttendance } = useStore();
  
  const [weekStats, setWeekStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchToday();
    loadWeekStats();
  }, [fetchToday]);

  const loadWeekStats = async () => {
    try {
      const res = await reportAPI.weekly();
      setWeekStats(res.data.data);
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (isLoadingToday && !todayWorkout) {
    return (
      <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto space-y-6">
        <div className="skeleton h-48 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  // Calculate Progress accurately based on our 3 statuses
  const completed = todayWorkout?.exercises.filter(e => e.status === 'completed').length || 0;
  const skipped = todayWorkout?.exercises.filter(e => e.status === 'skipped').length || 0;
  const total = todayWorkout?.exercises.length || 0;
  // Progress bar only counts completed, not skipped
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const todayDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  return (
    <div className="space-y-6 pb-24 md:pb-6 px-4 md:px-8 py-6 max-w-4xl mx-auto">
      
      {/* Welcome Header */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <p className="text-text-secondary text-sm font-medium">Welcome back,</p>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            {user?.name || user?.email?.split('@')[0]}
          </h1>
        </div>
        <div className="text-right">
          <p className="text-text-secondary text-xs uppercase tracking-widest font-bold">
            {format(new Date(), 'MMM do, yyyy')}
          </p>
        </div>
      </div>

      {/* Hero — Today's workout */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative card overflow-hidden p-6 md:p-8 shadow-xl"
      >
        {/* Abstract Background Gradient */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-brand rounded-full blur-[80px] opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-brand-orange/10 text-brand-orange text-[10px] uppercase tracking-widest font-bold rounded-md border border-brand-orange/20">
                Today's Focus
              </span>
              {todayWorkout?.attended && (
                <span className="flex items-center gap-1 text-status-success text-[10px] uppercase tracking-widest font-bold">
                  <CheckCircle2 size={12} /> Logged
                </span>
              )}
            </div>
            
            <h2 className="font-extrabold text-4xl text-text-primary tracking-tight leading-none mb-2">
              {todayWorkout?.isRestDay ? 'Recovery Day' : todayWorkout?.muscleGroup}
            </h2>
            
            {!todayWorkout?.isRestDay && (
              <p className="text-text-secondary text-sm font-medium">
                {total} exercises planned • {completed} completed
              </p>
            )}
          </div>

          <div className="w-full md:w-auto">
            {todayWorkout?.isRestDay ? (
              <Link to="/history" className="btn-ghost w-full md:w-auto px-6 py-3 justify-center">
                View History
              </Link>
            ) : (
              <Link to="/today" className="btn-fire inline-flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 group">
                <span className="tracking-wide">Enter Session</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {!todayWorkout?.isRestDay && total > 0 && (
          <div className="mt-8 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-secondary text-xs font-bold uppercase tracking-widest">Session Progress</span>
              <span className="text-brand-accent text-sm font-extrabold">{percent}%</span>
            </div>
            <div className="h-2.5 bg-app-bg rounded-full overflow-hidden border border-app-border">
              <motion.div
                className="h-full bg-gradient-brand rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Current Streak"
          value={statsLoading ? '-' : `${weekStats?.streak || 0} 🔥`}
          sub="consecutive days"
          icon={Flame}
          accent={true}
        />
        <StatCard
          label="Week Progress"
          value={statsLoading ? '-' : `${weekStats?.attendedDays || 0}/${weekStats?.totalWorkoutDays || 0}`}
          sub="days attended"
          icon={CalendarCheck}
        />
        <StatCard
          label="Volume"
          value={statsLoading ? '-' : weekStats?.completedExercises || 0}
          sub="exercises done"
          icon={Dumbbell}
        />
        <StatCard
          label="Consistency"
          value={statsLoading ? '-' : `${weekStats?.attendancePercentage || 0}%`}
          sub="weekly rate"
          icon={Target}
        />
      </div>

      {/* Weekly split overview */}
      <div className="card p-6">
        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4">Weekly Blueprint</h3>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day, i) => {
            const isToday = i === todayDayIndex;
            const isRest = WEEK_SPLITS[i] === 'Rest';
            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all ${
                  isToday 
                    ? 'bg-brand-orange/10 border-brand-orange/40 shadow-[0_0_15px_rgba(255,122,24,0.1)]' 
                    : 'bg-app-bg border-app-border'
                }`}
              >
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isToday ? 'text-brand-orange' : 'text-text-secondary'}`}>
                  {day}
                </p>
                <div className={`w-1.5 h-1.5 rounded-full ${isRest ? 'bg-app-border' : isToday ? 'bg-brand-accent' : 'bg-text-secondary/30'}`} />
              </motion.div>
            );
          })}
        </div>
        <div className="grid grid-cols-7 gap-2 mt-2">
          {WEEK_SPLITS.map((split, i) => (
            <div key={i} className="text-[9px] font-medium text-text-secondary/70 text-center leading-tight hidden md:block">
              {split}
            </div>
          ))}
        </div>
      </div>

      {/* Quick exercise preview */}
      {todayWorkout && !todayWorkout.isRestDay && todayWorkout.exercises.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Up Next</h3>
            <Link to="/today" className="text-brand-orange text-xs font-bold hover:text-brand-accent transition-colors flex items-center gap-1">
              Full List <ChevronRight size={14}/>
            </Link>
          </div>
          <div className="space-y-3">
            {todayWorkout.exercises.slice(0, 3).map((ex) => (
              <div key={ex._id} className="card bg-app-bg flex items-center justify-between p-4 border border-app-border/50">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    ex.status === 'completed' ? 'bg-status-success/10 border-status-success/30 text-status-success' : 
                    ex.status === 'skipped' ? 'bg-status-danger/10 border-status-danger/30 text-status-danger' : 
                    'bg-app-card border-app-border text-text-secondary'
                  }`}>
                    {ex.status === 'completed' ? <CheckCircle2 size={20}/> : 
                     ex.status === 'skipped' ? <XCircle size={20}/> : 
                     <Dumbbell size={18}/>}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${ex.status === 'skipped' ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                      {ex.name}
                    </p>
                    <p className="text-text-secondary text-[11px] uppercase tracking-wider mt-0.5 font-medium">
                      {ex.sets.length} Sets • {ex.sets[0]?.reps || 0} Reps
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {todayWorkout.exercises.length > 3 && (
              <Link to="/today" className="block text-center card bg-transparent border-dashed border-app-border text-text-secondary text-xs font-bold uppercase tracking-widest py-3 hover:border-brand-orange hover:text-brand-orange transition-colors">
                +{todayWorkout.exercises.length - 3} More Exercises
              </Link>
            )}
          </div>
        </div>
      )}

    </div>
  );
}