import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

export default function ResultCard({ exercise, onUndo }) {
  const isCompleted = exercise.status === 'completed';

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className={`flex items-center justify-between p-3 mb-2 rounded-xl border bg-app-card/50 backdrop-blur-sm ${
        isCompleted ? 'border-status-success/30' : 'border-status-danger/30'
      }`}
    >
      <div className="flex items-center gap-3">
        {isCompleted ? (
          <CheckCircle2 size={20} className="text-status-success" />
        ) : (
          <XCircle size={20} className="text-status-danger" />
        )}
        <div>
          <p className={`text-sm font-semibold ${isCompleted ? 'text-status-success' : 'text-status-danger'}`}>
            {exercise.name}
          </p>
          <p className="text-[10px] text-text-secondary uppercase tracking-wider">
            {exercise.status}
          </p>
        </div>
      </div>

      <button 
        onClick={() => onUndo(exercise._id, 'pending')}
        className="p-2 rounded-lg bg-app-bg border border-app-border hover:bg-app-border transition-colors text-text-secondary hover:text-text-primary"
      >
        <RotateCcw size={16} />
      </button>
    </motion.div>
  );
}