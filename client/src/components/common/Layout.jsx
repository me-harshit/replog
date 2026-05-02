import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Dumbbell, CalendarDays, BarChart3, Settings, Menu, X } from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <Zap size={20} /> },
  { path: '/today', label: "Today's Workout", icon: <Dumbbell size={20} /> },
  { path: '/history', label: 'History', icon: <CalendarDays size={20} /> },
  { path: '/reports', label: 'Reports', icon: <BarChart3 size={20} /> },
  { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const currentPage = navItems.find(n => location.pathname.startsWith(n.path))

  return (
    <div className="min-h-screen bg-app-bg flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-app-border bg-[#0a0a0a] sticky top-0 h-screen z-40">
        {/* Logo */}
        <div className="px-6 py-8 border-b border-app-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-fire flex items-center justify-center text-white shadow-lg shadow-brand-red/20">
              <Dumbbell size={24} />
            </div>
            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-brand tracking-tight">
              REPLOG
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-2 font-medium tracking-wide uppercase">
            Train Hard. Track Smart.
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-fire text-white shadow-md shadow-brand-orange/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-app-card'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-app-border">
          <p className="text-xs text-text-secondary font-medium">RepLog v1.0</p>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen w-full overflow-hidden">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-app-bg/80 border-b border-app-border px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-text-secondary hover:text-text-primary transition-colors p-1"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="md:hidden text-xl font-extrabold text-transparent bg-clip-text bg-gradient-brand tracking-tight">
              REPLOG
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-text-primary">
                {currentPage?.label || 'RepLog'}
              </h1>
            </div>
          </div>
          <div className="flex items-center">
            <div className="text-xs font-semibold text-text-secondary bg-app-card border border-app-border px-4 py-2 rounded-full shadow-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Page Content (Outlet) */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-app-border pb-safe pt-2 px-2">
        <div className="flex justify-around items-center">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 ${
                  isActive ? 'text-brand-orange scale-110' : 'text-text-secondary hover:text-text-primary'
                }`
              }
            >
              {item.icon}
              <span className="text-[10px] font-bold tracking-wide">
                {item.label.split("'")[0]}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-app-bg border-r border-app-border flex flex-col md:hidden shadow-2xl"
            >
              <div className="px-6 py-6 border-b border-app-border flex items-center justify-between">
                <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-brand tracking-tight">
                  REPLOG
                </span>
                <button 
                  onClick={() => setSidebarOpen(false)} 
                  className="text-text-secondary hover:text-status-danger transition-colors p-2 bg-app-card rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-bold transition-all ${
                        isActive 
                          ? 'bg-gradient-fire text-white shadow-lg' 
                          : 'text-text-secondary hover:bg-app-card hover:text-text-primary'
                      }`
                    }
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}