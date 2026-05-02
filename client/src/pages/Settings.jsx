import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, CalendarDays, LogOut, CheckCircle2, Shield, Dumbbell, ChevronDown, Plus, Trash2, Image as ImageIcon, Camera, Activity } from 'lucide-react';
import { settingsAPI } from '../services/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) { return twMerge(clsx(inputs)); }

export default function Settings() {
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState(null);
    const [blueprint, setBlueprint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploadingExerciseImg, setUploadingExerciseImg] = useState(null);
    const [uploading, setUploading] = useState(false);

    // UX State for auto-saving feedback
    const [savingField, setSavingField] = useState(null);
    const [expandedDay, setExpandedDay] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, blueprintRes] = await Promise.all([
                    settingsAPI.getProfile(),
                    settingsAPI.getBlueprint()
                ]);
                setProfile(profileRes.data.data);
                setBlueprint(blueprintRes.data.data);
            } catch (err) {
                console.error("Failed to load settings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getBMI = () => {
        const weight = profile?.profile?.weight;
        const height = profile?.profile?.height;

        if (!weight || !height) return { value: '--', label: 'Missing Data', color: 'text-text-secondary' };

        const heightMeters = height / 100;
        const bmi = (weight / (heightMeters * heightMeters)).toFixed(1);

        if (bmi < 18.5) return { value: bmi, label: 'Underweight', color: 'text-brand-orange' };
        if (bmi < 25) return { value: bmi, label: 'Normal', color: 'text-status-success' };
        if (bmi < 30) return { value: bmi, label: 'Overweight', color: 'text-brand-orange' };
        return { value: bmi, label: 'Obese', color: 'text-status-danger' };
    };

    const formatDateForInput = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toISOString().split('T')[0];
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const res = await settingsAPI.uploadAvatar(formData);
            setProfile(res.data.data); // Updates state with new S3 URL
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setUploading(false);
        }
    };

    const bmiData = getBMI();

    const handleLogout = () => {
        localStorage.removeItem('replog_token');
        window.location.href = '/'; // Force full reload to clear states and redirect to welcome
    };

    const handleProfileUpdate = async (field, value) => {
        if (profile[field] === value) return; // Don't save if unchanged
        setSavingField(field);
        try {
            await settingsAPI.updateProfile({ [field]: value });
            setProfile(prev => ({ ...prev, [field]: value }));
        } catch (err) {
            console.error("Failed to update profile");
        } finally {
            setTimeout(() => setSavingField(null), 1000); // Show checkmark briefly
        }
    };

    const handleBlueprintUpdate = async (dayName, field, value) => {
        const day = blueprint.days.find(d => d.dayName === dayName);
        if (day[field] === value) return;

        setSavingField(`${dayName}-${field}`);
        setBlueprint(prev => ({
            ...prev,
            days: prev.days.map(d => d.dayName === dayName ? { ...d, [field]: value } : d)
        }));

        try {
            await settingsAPI.updateDailyBlueprint(dayName, { [field]: value });
        } catch (err) { console.error(err); }
        finally { setTimeout(() => setSavingField(null), 1000); }
    };

    const handleExerciseUpdate = async (dayName, exerciseId, field, value) => {
        setSavingField(`${exerciseId}-${field}`);

        // Optimistic Update
        setBlueprint(prev => ({
            ...prev,
            days: prev.days.map(d => d.dayName === dayName ? {
                ...d,
                exercises: d.exercises.map(ex => ex._id === exerciseId ? { ...ex, [field]: value } : ex)
            } : d)
        }));

        try {
            await settingsAPI.updateBlueprintExercise(dayName, exerciseId, { [field]: value });
        } catch (err) { console.error("Failed to save exercise data"); }
        finally { setTimeout(() => setSavingField(null), 1000); }
    };

    const handleAddExercise = async (dayName) => {
        try {
            const res = await settingsAPI.addBlueprintExercise(dayName);
            setBlueprint(res.data.data); // Replace with server data to get the new _id
        } catch (err) { console.error("Failed to add exercise"); }
    };

    const handleExerciseImageUpload = async (e, dayName, exerciseId) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploadingExerciseImg(exerciseId);
        try {
            const res = await settingsAPI.uploadExerciseImage(dayName, exerciseId, formData);

            // Optimistic UI Update with new S3 data
            setBlueprint(res.data.data);

            // Show success checkmark briefly
            setSavingField(`${exerciseId}-imageUrl`);
            setTimeout(() => setSavingField(null), 1000);
        } catch (err) {
            console.error("Exercise image upload failed", err);
        } finally {
            setUploadingExerciseImg(null);
        }
    };

    const handleDeleteExercise = async (dayName, exerciseId) => {
        setBlueprint(prev => ({
            ...prev,
            days: prev.days.map(d => d.dayName === dayName ? {
                ...d, exercises: d.exercises.filter(ex => ex._id !== exerciseId)
            } : d)
        }));
        try {
            await settingsAPI.deleteBlueprintExercise(dayName, exerciseId);
        } catch (err) { console.error("Failed to delete exercise"); }
    };

    if (loading) return <div className="flex justify-center items-center h-[60vh]"><div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 pb-24">
            <header className="mb-8">
                <h1 className="text-2xl font-black text-text-primary tracking-tight uppercase">Settings</h1>
                <p className="text-text-secondary text-xs font-medium">Manage your identity and routine.</p>
            </header>

            {/* Premium Tab Navigation */}
            <div className="flex bg-app-card p-1.5 rounded-xl border border-app-border mb-8">
                {[
                    { id: 'profile', icon: UserIcon, label: 'Profile' },
                    { id: 'blueprint', icon: CalendarDays, label: 'Weekly Blueprint' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="relative flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold transition-colors z-10"
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-app-border rounded-lg"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <tab.icon size={16} className={cn("relative z-20", activeTab === tab.id ? "text-brand-orange" : "text-text-secondary")} />
                        <span className={cn("relative z-20", activeTab === tab.id ? "text-text-primary" : "text-text-secondary")}>
                            {tab.label}
                        </span>
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <motion.div key="profile" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

                        {/* Identity & Avatar Card */}
                        <div className="card p-6 border-app-border/40 flex flex-col md:flex-row gap-8 items-center md:items-start">

                            {/* Avatar Uploader */}
                            <div className="relative group shrink-0">
                                <div className="w-28 h-28 rounded-full border-2 border-app-border bg-app-bg overflow-hidden flex items-center justify-center relative">
                                    {profile?.profile?.avatarUrl ? (
                                        <img src={profile.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon size={40} className="text-text-secondary/50" />
                                    )}

                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>

                                <label className="absolute bottom-0 right-0 p-2.5 bg-brand-orange rounded-full text-white cursor-pointer hover:scale-110 transition-transform shadow-lg shadow-brand-orange/20">
                                    <Camera size={16} />
                                    <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                                </label>
                            </div>

                            {/* Basic Info */}
                            <div className="flex-1 w-full space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Display Name</label>
                                    <div className="relative">
                                        <input
                                            type="text" defaultValue={profile?.name}
                                            onBlur={(e) => handleProfileUpdate('name', e.target.value)}
                                            className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-brand-orange transition-colors"
                                        />
                                        {savingField === 'name' && <CheckCircle2 size={16} className="absolute right-4 top-3.5 text-status-success animate-pulse" />}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Email Address</label>
                                    <input type="email" value={profile?.email} disabled className="w-full bg-app-bg/50 border border-app-border/50 rounded-xl px-4 py-3 text-sm text-text-secondary cursor-not-allowed opacity-70" />
                                </div>
                            </div>
                        </div>

                        {/* Physical Metrics Card */}
                        <div className="card p-6 border-app-border/40">
                            <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Activity size={16} className="text-brand-orange" /> Physical Profile
                            </h3>

                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Inputs */}
                                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="relative">
                                        <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Date of Birth</label>
                                        <input
                                            type="date"
                                            defaultValue={formatDateForInput(profile?.profile?.dob)}
                                            onBlur={(e) => handleProfileUpdate('profile', { ...profile.profile, dob: e.target.value })}
                                            className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-brand-orange outline-none [color-scheme:dark]"
                                        />
                                    </div>
                                    <div className="relative">
                                        <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Height (cm)</label>
                                        <input type="number" defaultValue={profile?.profile?.height} onBlur={(e) => handleProfileUpdate('profile', { ...profile.profile, height: parseInt(e.target.value) })} className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-3 text-sm text-center text-text-primary focus:border-brand-orange" />
                                    </div>
                                    <div className="relative col-span-2 md:col-span-1">
                                        <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Weight (kg)</label>
                                        <input type="number" defaultValue={profile?.profile?.weight} onBlur={(e) => handleProfileUpdate('profile', { ...profile.profile, weight: parseInt(e.target.value) })} className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-3 text-sm text-center text-text-primary focus:border-brand-orange" />
                                    </div>
                                </div>

                                {/* BMI Display */}
                                <div className="md:w-48 bg-app-bg border border-app-border rounded-xl p-4 flex flex-col items-center justify-center text-center">
                                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Current BMI</span>
                                    <span className={cn("text-3xl font-black tracking-tighter", bmiData.color)}>{bmiData.value}</span>
                                    <span className={cn("text-xs font-bold mt-1 uppercase", bmiData.color)}>{bmiData.label}</span>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="card p-6 border-status-danger/20 bg-status-danger/5">
                            <h3 className="text-sm font-bold text-status-danger uppercase tracking-widest mb-4">Danger Zone</h3>
                            <p className="text-xs text-text-secondary mb-4">Disconnect your current session from this device.</p>
                            <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-status-danger/10 text-status-danger font-bold hover:bg-status-danger hover:text-white transition-all border border-status-danger/20">
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
                {/* BLUEPRINT TAB */}
                {activeTab === 'blueprint' && (
                    <motion.div key="blueprint" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        <div className="card p-6 border-app-border/40">
                            <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Dumbbell size={16} className="text-brand-orange" /> Default Weekly Split
                            </h3>
                            <p className="text-xs text-text-secondary mb-6">Design your master routine. Auto-saves instantly.</p>

                            <div className="space-y-4">
                                {blueprint?.days.map((day) => {
                                    const isExpanded = expandedDay === day.dayName;

                                    return (
                                        <div key={day._id} className={cn("bg-app-bg/50 border rounded-xl transition-all duration-300 overflow-hidden", isExpanded && !day.isRestDay ? "border-brand-orange/40" : "border-app-border/50")}>

                                            {/* Day Header */}
                                            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-center justify-between w-full md:w-auto md:flex-1 gap-4">
                                                    <span className="text-sm font-black text-text-primary uppercase tracking-wider min-w-[90px]">{day.dayName}</span>
                                                    <label className="flex items-center gap-2 cursor-pointer shrink-0">
                                                        <span className="text-[10px] font-bold text-text-secondary uppercase">Rest</span>
                                                        <div className="relative inline-flex items-center">
                                                            <input type="checkbox" className="sr-only peer" checked={day.isRestDay} onChange={(e) => handleBlueprintUpdate(day.dayName, 'isRestDay', e.target.checked)} />
                                                            <div className="w-9 h-5 bg-app-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-orange"></div>
                                                        </div>
                                                    </label>
                                                </div>

                                                <div className="flex items-center gap-2 w-full md:w-[60%]">
                                                    <div className="relative flex-1">
                                                        <input
                                                            type="text" defaultValue={day.muscleGroup} disabled={day.isRestDay}
                                                            onBlur={(e) => handleBlueprintUpdate(day.dayName, 'muscleGroup', e.target.value)}
                                                            placeholder="e.g., Chest & Triceps"
                                                            className={cn("w-full bg-app-card border border-app-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange transition-colors", day.isRestDay ? "opacity-30 cursor-not-allowed" : "text-text-primary")}
                                                        />
                                                        {savingField === `${day.dayName}-muscleGroup` && <CheckCircle2 size={14} className="absolute right-3 top-2.5 text-status-success animate-pulse" />}
                                                    </div>

                                                    <button
                                                        disabled={day.isRestDay}
                                                        onClick={() => setExpandedDay(isExpanded ? null : day.dayName)}
                                                        className={cn("p-2 rounded-lg border transition-colors", day.isRestDay ? "opacity-30 border-app-border text-text-secondary" : isExpanded ? "bg-brand-orange/10 border-brand-orange/30 text-brand-orange" : "bg-app-card border-app-border text-text-secondary hover:text-white")}
                                                    >
                                                        <ChevronDown size={18} className={cn("transition-transform duration-300", isExpanded && "rotate-180")} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expanded Exercise Routine Builder */}
                                            <AnimatePresence>
                                                {isExpanded && !day.isRestDay && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-app-border/50 bg-app-card/30 p-4">
                                                        <div className="space-y-4">
                                                            {day.exercises.map((ex, i) => (
                                                                <div key={ex._id} className="relative group bg-app-bg border border-app-border/60 p-4 rounded-xl space-y-3">

                                                                    {/* Delete Button */}
                                                                    <button onClick={() => handleDeleteExercise(day.dayName, ex._id)} className="absolute -top-3 -right-3 p-2 bg-status-danger text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity scale-75 hover:scale-100">
                                                                        <Trash2 size={14} />
                                                                    </button>

                                                                    {/* Row 1: Name & Image URL */}
                                                                    <div className="flex flex-col md:flex-row gap-3">
                                                                        <div className="relative flex-1">
                                                                            <label className="text-[9px] font-bold text-text-secondary uppercase tracking-widest mb-1 block">Exercise Name</label>
                                                                            <input type="text" defaultValue={ex.name} onBlur={(e) => handleExerciseUpdate(day.dayName, ex._id, 'name', e.target.value)} className="w-full bg-app-card border border-app-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-brand-orange outline-none" />
                                                                            {savingField === `${ex._id}-name` && <CheckCircle2 size={12} className="absolute right-3 bottom-3 text-status-success animate-pulse" />}
                                                                        </div>

                                                                        {/* NEW S3 UPLOADER UI */}
                                                                        <div className="relative flex-1">
                                                                            <label className="text-[9px] font-bold text-text-secondary uppercase tracking-widest mb-1 flex items-center gap-1">
                                                                                <ImageIcon size={10} /> Exercise Image
                                                                            </label>
                                                                            <div className="flex items-center gap-3">
                                                                                {ex.imageUrl && (
                                                                                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-app-border bg-app-card">
                                                                                        <img src={ex.imageUrl} alt="Exercise" className="w-full h-full object-cover" />
                                                                                    </div>
                                                                                )}
                                                                                <label className={cn(
                                                                                    "flex-1 cursor-pointer bg-app-card border border-app-border border-dashed rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors flex items-center justify-center gap-2",
                                                                                    uploadingExerciseImg === ex._id ? "opacity-70" : "hover:border-brand-orange hover:text-brand-orange"
                                                                                )}>
                                                                                    {uploadingExerciseImg === ex._id ? (
                                                                                        <div className="w-4 h-4 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
                                                                                    ) : (
                                                                                        <>
                                                                                            <Camera size={14} />
                                                                                            <span className="truncate">{ex.imageUrl ? 'Change Image' : 'Upload Image'}</span>
                                                                                        </>
                                                                                    )}
                                                                                    <input
                                                                                        type="file"
                                                                                        accept="image/png, image/jpeg, image/webp, image/gif"
                                                                                        className="hidden"
                                                                                        onChange={(e) => handleExerciseImageUpload(e, dayName, ex._id)}
                                                                                        disabled={uploadingExerciseImg === ex._id}
                                                                                    />
                                                                                </label>
                                                                                {savingField === `${ex._id}-imageUrl` && <CheckCircle2 size={16} className="text-status-success animate-pulse shrink-0" />}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Row 2: Description */}
                                                                    <div className="relative">
                                                                        <label className="text-[9px] font-bold text-text-secondary uppercase tracking-widest mb-1 block">Form Tips / Description</label>
                                                                        <textarea defaultValue={ex.description} rows="2" onBlur={(e) => handleExerciseUpdate(day.dayName, ex._id, 'description', e.target.value)} className="w-full bg-app-card border border-app-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-brand-orange outline-none resize-none custom-scrollbar" />
                                                                        {savingField === `${ex._id}-description` && <CheckCircle2 size={12} className="absolute right-3 bottom-3 text-status-success animate-pulse" />}
                                                                    </div>

                                                                    {/* Row 3: Sets & Reps */}
                                                                    <div className="flex items-center gap-4 border-t border-app-border/40 pt-3">
                                                                        <div className="relative flex items-center gap-2">
                                                                            <label className="text-[10px] font-bold text-text-secondary uppercase">Sets:</label>
                                                                            <input type="number" min="1" max="10" defaultValue={ex.setsCount} onBlur={(e) => handleExerciseUpdate(day.dayName, ex._id, 'setsCount', parseInt(e.target.value))} className="w-16 bg-app-card border border-app-border rounded-md px-2 py-1 text-sm text-center text-text-primary focus:border-brand-orange outline-none" />
                                                                            {savingField === `${ex._id}-setsCount` && <CheckCircle2 size={12} className="absolute -right-4 top-1.5 text-status-success animate-pulse" />}
                                                                        </div>
                                                                        <div className="relative flex items-center gap-2">
                                                                            <label className="text-[10px] font-bold text-text-secondary uppercase">Target Reps:</label>
                                                                            <input type="text" defaultValue={ex.targetReps} placeholder="e.g. 8-12" onBlur={(e) => handleExerciseUpdate(day.dayName, ex._id, 'targetReps', e.target.value)} className="w-20 bg-app-card border border-app-border rounded-md px-2 py-1 text-sm text-center text-text-primary focus:border-brand-orange outline-none" />
                                                                            {savingField === `${ex._id}-targetReps` && <CheckCircle2 size={12} className="absolute -right-4 top-1.5 text-status-success animate-pulse" />}
                                                                        </div>
                                                                    </div>

                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Add Exercise Button */}
                                                        <button onClick={() => handleAddExercise(day.dayName)} className="mt-4 w-full py-3 border border-dashed border-app-border rounded-xl text-xs font-bold text-text-secondary uppercase tracking-widest hover:border-brand-orange hover:text-brand-orange transition-colors flex items-center justify-center gap-2">
                                                            <Plus size={14} /> Add Exercise
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}