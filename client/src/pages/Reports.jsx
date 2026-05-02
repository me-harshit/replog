import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Flame, Target, Activity, Trophy } from 'lucide-react';
import { reportAPI } from '../services/api';

const PIE_COLORS = ['#ff3b3b', '#ff7a18', '#ff9f43', '#ef4444', '#22c55e'];

export default function Reports() {
  const [data, setData] = useState({
    weekly: [],
    monthly: [],
    allTime: null,
    streak: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllReports = async () => {
      try {
        // Fire all 4 API calls concurrently for maximum performance
        const [weeklyRes, monthlyRes, allTimeRes, streakRes] = await Promise.all([
          reportAPI.weekly(),
          reportAPI.monthly(),
          reportAPI.allTime(),
          reportAPI.streak()
        ]);

        // Format weekly data for the chart (Convert "2026-05-01" to "May 01")
        const formattedWeekly = weeklyRes.data.data.map(item => ({
          date: format(parseISO(item._id), 'MMM dd'),
          volume: item.volume
        }));

        setData({
          weekly: formattedWeekly,
          monthly: monthlyRes.data.data.map(item => ({ name: item._id, value: item.count })),
          allTime: allTimeRes.data.data,
          streak: streakRes.data.data.currentStreak
        });
      } catch (err) {
        console.error("Failed to load reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllReports();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
        <p className="text-text-secondary text-xs font-bold uppercase tracking-widest">Aggregating Data...</p>
      </div>
    );
  }

  // Safe calculations
  const totalWorkouts = data.allTime?.workouts?.totalWorkouts || 0;
  const attendedWorkouts = data.allTime?.workouts?.attendedWorkouts || 0;
  const attendanceRate = totalWorkouts > 0 ? Math.round((attendedWorkouts / totalWorkouts) * 100) : 0;
  const totalVolume = data.allTime?.volume || 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto px-4 md:px-8 py-6 pb-24 space-y-8"
    >
      <header>
        <h1 className="text-2xl font-black text-text-primary tracking-tight uppercase">Analytics</h1>
        <p className="text-text-secondary text-xs font-medium">Your lifting metrics and consistency.</p>
      </header>

      {/* KPI Stats Grid (Using All-Time & Streak APIs) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 flex flex-col items-center text-center hover:border-brand-orange/30 transition-colors">
          <Flame size={20} className="text-brand-orange mb-2" />
          <span className="text-2xl font-black text-text-primary">{data.streak}</span>
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Day Streak</span>
        </div>
        
        <div className="card p-4 flex flex-col items-center text-center hover:border-brand-orange/30 transition-colors">
          <Activity size={20} className="text-status-success mb-2" />
          <span className="text-2xl font-black text-text-primary">{attendanceRate}%</span>
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Consistency</span>
        </div>

        <div className="card p-4 flex flex-col items-center text-center hover:border-brand-orange/30 transition-colors">
          <Target size={20} className="text-brand-red mb-2" />
          <span className="text-2xl font-black text-text-primary">{attendedWorkouts}</span>
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Total Sessions</span>
        </div>

        <div className="card p-4 flex flex-col items-center text-center hover:border-brand-orange/30 transition-colors">
          <Trophy size={20} className="text-[#fbbf24] mb-2" />
          <span className="text-2xl font-black text-text-primary">
            {(totalVolume / 1000).toFixed(1)}k
          </span>
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Volume (Tons)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Volume Chart (Using Weekly API) */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest mb-6">7-Day Volume Trend</h3>
          <div className="h-64 w-full">
            {data.weekly.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.weekly}>
                  <defs>
                    <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff7a18" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ff3b3b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                  <XAxis dataKey="date" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#181818', border: '1px solid #2a2a2a', borderRadius: '12px' }}
                    itemStyle={{ color: '#f5f5f5', fontSize: '14px', fontWeight: 'bold' }}
                    cursor={{ fill: '#2a2a2a', opacity: 0.4 }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#ff7a18" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-secondary text-sm">No volume data for the last 7 days.</div>
            )}
          </div>
        </div>

        {/* Monthly Muscle Split (Using Monthly API) */}
        <div className="card p-6 flex flex-col">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest mb-6">30-Day Muscle Split</h3>
          <div className="h-48 w-full">
            {data.monthly.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.monthly} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                    {data.monthly.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#181818', border: '1px solid #2a2a2a', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-secondary text-sm">No split data available.</div>
            )}
          </div>
          
          {/* Custom Legend */}
          <div className="flex flex-wrap gap-3 mt-6 justify-center">
            {data.monthly.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-[10px] font-bold text-text-secondary uppercase">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}