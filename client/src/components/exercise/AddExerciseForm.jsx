import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import useStore from '../../store/useStore';

export default function AddExerciseForm({ dayId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const addExercise = useStore((state) => state.addExercise);
  
  const [form, setForm] = useState({
    name: '',
    sets: 3,
    reps: '10',
    description: '',
    imageUrl: '',
  });

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    
    setLoading(true);
    try {
      // Map the simple form inputs into the array of objects our schema expects
      const newExerciseData = {
        name: form.name,
        description: form.description,
        imageUrl: form.imageUrl,
        sets: Array.from({ length: form.sets }, () => ({
          reps: parseInt(form.reps) || 0,
          weight: 0,
          isCompleted: false
        }))
      };

      await addExercise(dayId, newExerciseData);
      
      // Reset and close
      setForm({ name: '', sets: 3, reps: '10', description: '', imageUrl: '' });
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 mb-8">
      {/* Toggle Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 rounded-xl border border-dashed border-app-border text-text-secondary font-medium hover:border-brand-orange hover:text-brand-orange transition-all duration-300 flex items-center justify-center gap-2 bg-app-card/30"
      >
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }}>
          <Plus size={20} />
        </motion.div>
        {isOpen ? 'Cancel' : 'Add Custom Exercise'}
      </motion.button>

      {/* Expandable Form */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="card p-5 mt-4 space-y-4">
              <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">New Exercise</h4>

              <input
                type="text"
                placeholder="Exercise name (e.g., Barbell Rows) *"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-dark w-full text-sm placeholder:text-text-secondary/50"
              />

              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider absolute -top-2 left-3 bg-app-card px-1">Sets</label>
                  <input
                    type="number"
                    min="1"
                    value={form.sets}
                    onChange={e => setForm({ ...form, sets: parseInt(e.target.value) || 1 })}
                    className="input-dark w-full text-sm text-center font-mono mt-1"
                  />
                </div>
                <div className="flex-1 relative">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider absolute -top-2 left-3 bg-app-card px-1">Target Reps</label>
                  <input
                    type="text"
                    value={form.reps}
                    onChange={e => setForm({ ...form, reps: e.target.value })}
                    className="input-dark w-full text-sm text-center font-mono mt-1"
                    placeholder="10-12"
                  />
                </div>
              </div>

              <textarea
                placeholder="Notes or description (optional)"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="input-dark w-full text-sm resize-none placeholder:text-text-secondary/50"
              />

              <input
                type="url"
                placeholder="Image/GIF URL (optional AWS link)"
                value={form.imageUrl}
                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                className="input-dark w-full text-sm placeholder:text-text-secondary/50"
              />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn-ghost flex-1 text-sm py-3"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !form.name.trim()}
                  className="btn-fire flex-1 text-sm py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Save Exercise'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}