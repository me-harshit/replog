export function SkeletonCard({ className = '' }) {
  return (
    <div className={`card p-5 ${className}`}>
      <div className="skeleton h-4 w-1/3 mb-3" />
      <div className="skeleton h-6 w-2/3 mb-2" />
      <div className="skeleton h-4 w-full mb-1" />
      <div className="skeleton h-4 w-4/5" />
    </div>
  );
}

export function SkeletonExercise() {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-xl" />
        <div className="flex-1">
          <div className="skeleton h-4 w-1/2 mb-2" />
          <div className="skeleton h-3 w-1/3" />
        </div>
        <div className="skeleton w-8 h-8 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="card p-5">
      <div className="skeleton h-3 w-1/2 mb-3" />
      <div className="skeleton h-8 w-1/3 mb-1" />
      <div className="skeleton h-3 w-2/3" />
    </div>
  );
}