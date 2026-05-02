import { Navigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

export default function ProtectedRoute() {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
          className="text-brand-orange mb-4"
        >
          <Dumbbell size={48} />
        </motion.div>
        <p className="text-text-secondary text-sm font-semibold tracking-widest uppercase">
          Warming up...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}