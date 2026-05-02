import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronDown, Dumbbell, Target, Trash2 } from 'lucide-react';
import { useState, useCallback, useEffect, useRef } from 'react';
import debounce from 'lodash.debounce'; 
import useStore from '../../store/useStore'; 

export default function ExerciseCard({ exercise, workoutId, onSwipe, isExpanded, onToggle, onActivity }) {
  const controls = useAnimation();
  const [localSets, setLocalSets] = useState(exercise.sets);
  
  // NEW: Ref to track user intent
  const isInitialMount = useRef(true);
  const userToggledSet = useRef(false); 
  
  const updateSetsReps = useStore(state => state.updateSetsReps);
  const deleteExercise = useStore(state => state.deleteExercise);

  const debouncedSave = useCallback(
    debounce(async (updatedSets) => {
      try {
        await updateSetsReps(workoutId, exercise._id, { sets: updatedSets });
      } catch (error) {
        console.error("Failed to auto-save sets", error);
      }
    }, 1000),
    [workoutId, exercise._id, updateSetsReps]
  );

  // 1. PURE EVENT HANDLER: Inputs
  const handleInputChange = (index, field, value) => {
    const numericValue = value === '' ? '' : parseInt(value, 10) || 0;
    
    setLocalSets(prevSets => prevSets.map((set, i) =>
      i === index ? { ...set, [field]: numericValue } : set
    ));
    
    if (onActivity) onActivity(); 
  };

  // 2. PURE EVENT HANDLER: Checkboxes
  const handleToggleSet = (index) => {
    // Flag that the user actively interacted with the checkboxes
    userToggledSet.current = true; 

    setLocalSets(prevSets => prevSets.map((set, i) =>
      i === index ? { ...set, isCompleted: !set.isCompleted } : set
    ));
    
    if (onActivity) onActivity(); 
  };

  // 3. THE WATCHER: Handles Side-Effects
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // A. Sync to Database
    debouncedSave(localSets);

    // B. Auto-Complete Logic
    const allDone = localSets.length > 0 && localSets.every(set => set.isCompleted);
    
    // NEW: Only auto-swipe if the user ACTUALLY toggled a set to reach this state
    if (allDone && userToggledSet.current) {
      const timer = setTimeout(() => {
        onSwipe(exercise._id, 'completed');
        userToggledSet.current = false; // Reset the intent flag
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [localSets, debouncedSave, onSwipe, exercise._id]);

  const handleDragEnd = async (event, info) => {
    if (isExpanded) {
      controls.start({ x: 0 });
      return;
    }

    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 100 || velocity > 500) {
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.2 } });
      onSwipe(exercise._id, 'completed');
    } else if (offset < -100 || velocity < -500) {
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.2 } });
      onSwipe(exercise._id, 'skipped');
    } else {
      controls.start({ x: 0 });
    }
  };

  return (
    <div className="relative mb-4 overflow-hidden rounded-2xl bg-app-border">
      {/* Background Indicators */}
      <div className="absolute inset-0 flex items-center justify-between px-6 z-0">
        <div className="flex items-center text-status-success">
          <CheckCircle2 size={28} /> <span className="ml-2 font-semibold">Done</span>
        </div>
        <div className="flex items-center text-status-danger">
          <span className="mr-2 font-semibold">Skip</span> <XCircle size={28} />
        </div>
      </div>

      {/* Swipeable & Tappable Card */}
      <motion.div
        drag={isExpanded ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        layout
        className="relative z-10 bg-app-card border border-app-border rounded-2xl p-5 shadow-lg backdrop-blur-sm cursor-pointer select-none"
        onClick={(e) => {
          if (e.target.tagName === 'INPUT' || e.target.closest('button')) return;
          onToggle();
        }}
      >
        {/* Card Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">{exercise.name}</h3>
            <p className="text-xs text-text-secondary mt-1">
              Tap to details • Swipe to finish
            </p>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="text-text-secondary p-1 bg-app-bg rounded-full border border-app-border"
          >
            <ChevronDown size={20} />
          </motion.div>
        </div>
        
        {/* Expandable Details Area */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 pt-4 border-t border-app-border overflow-hidden"
              onClick={(e) => e.stopPropagation()} 
            >
              
              <div className="mb-6 flex gap-4 bg-app-bg/50 p-3 rounded-xl border border-app-border">
                {exercise.imageUrl ? (
                  <img 
                    src={exercise.imageUrl} 
                    alt={exercise.name} 
                    className="w-24 h-24 object-cover rounded-lg bg-app-card"
                  />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center shrink-0 rounded-lg bg-app-card border border-app-border text-text-secondary">
                    <Dumbbell size={32} />
                  </div>
                )}
                <div className="flex-1 text-sm text-text-secondary overflow-y-auto max-h-24 pr-2 custom-scrollbar">
                  {exercise.description || "No explanation provided for this exercise yet."}
                </div>
              </div>

              {/* Sets Table Header */}
              <div className="grid grid-cols-6 gap-2 mb-3 text-center text-xs font-bold text-text-secondary uppercase tracking-wider px-2">
                <div className="col-span-1">Set</div>
                <div className="col-span-2 flex items-center justify-center gap-1"><Dumbbell size={12}/> Weight</div>
                <div className="col-span-2 flex items-center justify-center gap-1"><Target size={12}/> Reps</div>
                <div className="col-span-1"></div>
              </div>

              {/* Individual Sets */}
              {localSets.map((set, idx) => (
                <div key={idx} className={`grid grid-cols-6 gap-2 items-center mb-3 p-2 rounded-xl border transition-colors ${set.isCompleted ? 'bg-status-success/10 border-status-success/30' : 'bg-app-bg border-app-border'}`}>
                  <div className={`col-span-1 text-center font-bold transition-colors ${set.isCompleted ? 'text-status-success' : 'text-text-secondary'}`}>
                    {idx + 1}
                  </div>
                  
                  {/* Weight Input */}
                  <div className="col-span-2 relative">
                    <input 
                      type="number"
                      inputMode="decimal"
                      value={set.weight === 0 ? '' : set.weight}
                      placeholder="0"
                      onChange={(e) => handleInputChange(idx, 'weight', e.target.value)}
                      disabled={set.isCompleted}
                      className="w-full bg-app-card text-text-primary text-center font-bold p-3 rounded-lg border border-app-border focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-colors disabled:opacity-50"
                    />
                    <span className="absolute right-2 bottom-1 text-[9px] text-text-secondary">kg</span>
                  </div>

                  {/* Reps Input */}
                  <div className="col-span-2 relative">
                    <input 
                      type="number"
                      inputMode="numeric"
                      value={set.reps === 0 ? '' : set.reps}
                      placeholder="0"
                      onChange={(e) => handleInputChange(idx, 'reps', e.target.value)}
                      disabled={set.isCompleted}
                      className="w-full bg-app-card text-text-primary text-center font-bold p-3 rounded-lg border border-app-border focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-colors disabled:opacity-50"
                    />
                  </div>

                  {/* Individual Set Checkmark */}
                  <div className="col-span-1 flex justify-center">
                    <button 
                      onClick={() => handleToggleSet(idx)}
                      className={`transition-all duration-300 hover:scale-110 ${set.isCompleted ? 'text-status-success drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'text-app-border hover:text-text-secondary'}`}
                    >
                      <CheckCircle2 size={28} className={set.isCompleted ? "fill-status-success/20" : ""} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Delete Exercise Button */}
              <div className="mt-4 pt-3 flex justify-end border-t border-app-border/50">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteExercise(workoutId, exercise._id);
                  }}
                  className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:status-danger transition-colors py-2 px-3 rounded-lg hover:bg-status-danger/10"
                >
                  <Trash2 size={16} />
                  <span>Remove from Today</span>
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}