import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Mail, Lock, ChevronRight } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

export default function Welcome() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, isLoading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // If already authenticated, push straight to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    const success = isLogin
      ? await login({ email: formData.email, password: formData.password })
      : await register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

    if (success) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-app-bg flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-red/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-orange/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-brand shadow-lg shadow-brand-red/20 mb-4 glow-fire">
            <Dumbbell size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-brand tracking-tight">
            REPLOG
          </h1>
          <p className="text-text-secondary mt-2 font-medium tracking-wide">
            Train Hard. Track Smart.
          </p>
        </div>

        {/* Auth Card */}
        <div className="card p-6 md:p-8 backdrop-blur-xl bg-app-card/80 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                {isLogin ? 'Welcome back' : 'Create your account'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-dark w-full pl-10 py-3"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-dark w-full pl-10 py-3"
                  />
                </div>

                {!isLogin && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="relative overflow-hidden"
                  >
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                    <input
                      type="password"
                      required
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="input-dark w-full pl-10 py-3"
                    />
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || (!isLogin && formData.password !== formData.confirmPassword)}
                  className="btn-fire w-full py-3.5 mt-2 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Start Training')}
                  {!isLoading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setFormData({ email: '', password: '', confirmPassword: '' });
                  }}
                  className="text-sm font-medium text-text-secondary hover:text-brand-orange transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}