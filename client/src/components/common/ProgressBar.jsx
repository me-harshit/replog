import { motion } from 'framer-motion';

export default function ProgressBar({ value = 0, max = 100, label, showPercent = true, color = 'brand' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  const barColor = color === 'brand' ? 'bg-gradient-brand' : 'bg-status-success';

  return (
    <div className="space-y-1.5 w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-xs text-text-secondary">{label}</span>}
          {showPercent && <span className="text-xs font-mono text-brand-orange">{pct}%</span>}
        </div>
      )}
      <div className="h-2 bg-app-border rounded-full overflow-hidden shadow-inner">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}