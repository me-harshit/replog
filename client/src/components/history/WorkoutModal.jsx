import { motion } from 'framer-motion';
import { X, Calendar as CalIcon, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function WorkoutModal({ workout, loading, onClose }) {
  if (!workout && !loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-md bg-app-card border border-app-border rounded-3xl shadow-2xl overflow-hidden"
      >
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
            <p className="text-text-secondary text-[10px] font-bold uppercase tracking-widest">Loading Details...</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-app-border bg-gradient-to-br from-brand-red/10 to-brand-orange/5">
              <button onClick={onClose} className="absolute top-4 right-4 p-2 text-text-secondary hover:text-white"><X size={20} /></button>
              <div className="flex items-center gap-2 mb-1 text-brand-orange">
                <CalIcon size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{format(new Date(workout.date), 'PPPP')}</span>
              </div>
              <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight">{workout.isRestDay ? 'Rest Day' : workout.muscleGroup}</h2>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-3">
              {workout.exercises.map((ex, i) => (
                <div key={i} className="bg-app-bg/50 border border-app-border/40 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {ex.status === 'completed' ? <CheckCircle2 size={16} className="text-status-success" /> : 
                     ex.status === 'skipped' ? <XCircle size={16} className="text-brand-orange" /> : <Clock size={16} className="text-text-secondary" />}
                    <span className="text-sm font-bold text-text-primary">{ex.name}</span>
                  </div>
                  <div className="flex gap-1">
                    {ex.sets.map((s, idx) => <span key={idx} className="text-[9px] font-mono text-text-secondary">{s.weight}k</span>)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}