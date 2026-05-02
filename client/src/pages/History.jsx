import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths, isToday, getMonth, getYear } from 'date-fns';
import { List, Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Clock } from 'lucide-react';
import { workoutDayAPI } from '../services/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import WorkoutModal from '../components/history/WorkoutModal'; // Ensure path is correct

function cn(...inputs) { return twMerge(clsx(inputs)); }

export default function History() {
  const [view, setView] = useState('list'); 
  const [history, setHistory] = useState([]);
  const [calendarStats, setCalendarStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchHistory = useCallback(async (pageNum) => {
    setLoading(true);
    try {
      const res = await workoutDayAPI.getHistory(pageNum, 15);
      setHistory(prev => pageNum === 1 ? res.data.data : [...prev, ...res.data.data]);
      setHasMore(res.data.pagination.hasMore);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  const fetchCalendarStats = useCallback(async () => {
    try {
      const res = await workoutDayAPI.getCalendarStats(getMonth(currentMonth), getYear(currentMonth));
      setCalendarStats(res.data.data);
    } catch (err) { console.error(err); }
  }, [currentMonth]);

  useEffect(() => { fetchHistory(1); }, [fetchHistory]);
  useEffect(() => { fetchCalendarStats(); }, [fetchCalendarStats]);

  const openPopup = async (id) => {
    setModalLoading(true);
    setSelectedWorkout({ _id: id }); // Placeholder for AnimatePresence
    try {
      const res = await workoutDayAPI.getWorkoutDetail(id);
      setSelectedWorkout(res.data.data);
    } catch (err) { setSelectedWorkout(null); } finally { setModalLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 pb-24">
      {/* View Toggle */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-text-primary tracking-tight uppercase">History</h1>
        <div className="flex bg-app-card p-1 rounded-xl border border-app-border">
          <button onClick={() => setView('list')} className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", view === 'list' ? "bg-gradient-brand text-white shadow-lg" : "text-text-secondary")}>
            <List size={14} className="inline mr-2" /> List
          </button>
          <button onClick={() => setView('calendar')} className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", view === 'calendar' ? "bg-gradient-brand text-white shadow-lg" : "text-text-secondary")}>
            <CalendarIcon size={14} className="inline mr-2" /> Calendar
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <ListView key="list" history={history} hasMore={hasMore} onLoadMore={() => { setPage(p => p+1); fetchHistory(page+1); }} />
        ) : (
          <CalendarView key="calendar" stats={calendarStats} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} onDateClick={openPopup} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedWorkout && <WorkoutModal workout={selectedWorkout} loading={modalLoading} onClose={() => setSelectedWorkout(null)} />}
      </AnimatePresence>
    </div>
  );
}

/** 
 * LIST VIEW: Compact Expandable Accordion
 */
function ListView({ history, hasMore, onLoadMore }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="space-y-3">
      {history.map((workout) => {
        const isExpanded = expandedId === workout._id;
        const hasActivity = workout.exercises.some(ex => ex.status !== 'pending');
        const color = workout.isRestDay ? 'text-text-secondary' : (hasActivity ? 'text-status-success' : 'text-status-danger');

        return (
          <div key={workout._id} className={cn("card overflow-hidden border-app-border/40 transition-all", isExpanded && "border-brand-orange/40 ring-1 ring-brand-orange/10")}>
            <div onClick={() => setExpandedId(isExpanded ? null : workout._id)} className="p-3 flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-lg flex flex-col items-center justify-center text-[10px] font-black border border-app-border bg-app-bg", color)}>
                  <span>{format(new Date(workout.date), 'MMM')}</span>
                  <span className="text-sm -mt-1">{format(new Date(workout.date), 'dd')}</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">{workout.isRestDay ? 'Rest' : workout.muscleGroup}</h4>
                  <p className={cn("text-[10px] font-bold uppercase", color)}>{workout.isRestDay ? 'Recovery' : (hasActivity ? 'Attended' : 'Missed')}</p>
                </div>
              </div>
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-text-secondary"><ChevronDown size={16} /></motion.div>
            </div>
            <AnimatePresence>
              {isExpanded && !workout.isRestDay && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-3 pb-4 border-t border-app-border/50 bg-app-bg/20">
                  <div className="pt-3 space-y-2">
                    {workout.exercises.map((ex, i) => (
                      <div key={i} className="flex justify-between text-xs p-2 rounded bg-app-card/50">
                        <span className={cn("font-medium", ex.status === 'completed' ? "text-text-primary" : "text-text-secondary line-through")}>{ex.name}</span>
                        <div className="flex gap-1">
                          {ex.sets.map((s, idx) => <span key={idx} className="text-[10px] text-text-secondary">{s.weight}k</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      {hasMore && <button onClick={onLoadMore} className="w-full py-4 text-[10px] font-bold text-brand-orange uppercase tracking-widest hover:text-brand-red">Load More</button>}
    </div>
  );
}

/** 
 * CALENDAR VIEW: Full Month Grid
 */
function CalendarView({ stats, currentMonth, setCurrentMonth, onDateClick }) {
  const days = useMemo(() => eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) }), [currentMonth]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-black text-text-primary uppercase tracking-tighter">{format(currentMonth, 'MMMM yyyy')}</h3>
        <div className="flex gap-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 btn-ghost rounded-lg"><ChevronLeft size={18} /></button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 btn-ghost rounded-lg"><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {[...Array(days[0].getDay() === 0 ? 6 : days[0].getDay() - 1)].map((_, i) => <div key={i} />)}
        {days.map(day => {
          const stat = stats.find(s => isSameDay(new Date(s.date), day));
          return (
            <div key={day.toString()} onClick={() => stat && onDateClick(stat._id)}
              className={cn("aspect-square rounded-xl border flex flex-col items-center justify-center transition-all", 
                isToday(day) ? "border-brand-orange bg-brand-orange/5" : "border-app-border bg-app-bg/40", 
                stat ? "cursor-pointer hover:border-brand-orange/40" : "opacity-30")}
            >
              <span className="text-[10px] font-bold text-text-secondary">{format(day, 'd')}</span>
              {stat && <div className={cn("w-1.5 h-1.5 rounded-full mt-1", 
                stat.status === 'attended' ? "bg-status-success shadow-[0_0_8px_#22c55e]" : 
                stat.status === 'rest' ? "bg-text-secondary/40" : "bg-status-danger")} />}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}