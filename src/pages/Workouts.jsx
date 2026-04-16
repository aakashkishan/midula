import { useState } from 'react';
import confetti from 'canvas-confetti';
import WorkoutDetail from './WorkoutDetail';
import '../App.css';

const CATEGORY_STYLES = {
    CROSSFIT: { bg: 'bg-orange', text: 'text-orange', pill: 'rgba(254,128,25,0.18)', color: '#fe8019' },
    HIIT:     { bg: 'bg-red',    text: 'text-red',    pill: 'rgba(251,73,52,0.18)',  color: '#fb4934' },
    YOGA:     { bg: 'bg-purple', text: 'text-purple', pill: 'rgba(211,134,155,0.18)',color: '#d3869b' },
    PILATES:  { bg: 'bg-blue',   text: 'text-blue',   pill: 'rgba(131,165,152,0.18)',color: '#83a598' },
    CORE:     { bg: 'bg-aqua',   text: 'text-aqua',   pill: 'rgba(142,192,124,0.18)',color: '#8ec07c' },
    WALK:     { bg: 'bg-yellow', text: 'text-yellow', pill: 'rgba(184,187,38,0.18)', color: '#b8bb26' },
};

export default function Workouts() {
    const [started, setStarted] = useState(null);
    const [activeRoutine, setActiveRoutine] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');

    const routines = [
        { id: 1, title: 'Beginner Core Flow',   duration: '15 min', level: 'Beginner',     emoji: '🧘',    cal: '120 kcal', category: 'CORE',     difficulty: 'Beginner'     },
        { id: 2, title: 'HIIT Cardio Blast',    duration: '20 min', level: 'Intermediate', emoji: '⚡',    cal: '250 kcal', category: 'HIIT',     difficulty: 'Intermediate' },
        { id: 3, title: 'Yoga & Stretch',        duration: '30 min', level: 'All Levels',   emoji: '🧎‍♀️', cal: '90 kcal',  category: 'YOGA',     difficulty: 'Beginner'     },
        { id: 4, title: 'Pilates Sculpt',        duration: '25 min', level: 'Intermediate', emoji: '💪',    cal: '180 kcal', category: 'PILATES',  difficulty: 'Intermediate' },
        { id: 5, title: 'Evening Walk',          duration: '40 min', level: 'Easy',         emoji: '🚶‍♀️', cal: '150 kcal', category: 'WALK',     difficulty: 'Beginner'     },
        { id: 6, title: 'CrossFit Metcon Burn', duration: '25 min', level: 'Advanced',     emoji: '🔥',    cal: '380 kcal', category: 'CROSSFIT', difficulty: 'Advanced'     },
        { id: 7, title: 'Power HIIT',            duration: '22 min', level: 'Advanced',     emoji: '💥',    cal: '310 kcal', category: 'HIIT',     difficulty: 'Advanced'     },
    ];

    const filters = ['All', 'Beginner', 'Intermediate', 'Advanced'];

    const filteredRoutines = activeFilter === 'All'
        ? routines
        : routines.filter(r => r.difficulty === activeFilter);

    const handleStart = (id) => {
        setStarted(id);
        const routine = routines.find(r => r.id === id);
        const catStyle = CATEGORY_STYLES[routine?.category] ?? CATEGORY_STYLES.CORE;
        confetti({
            particleCount: 60,
            spread: 65,
            origin: { y: 0.65 },
            colors: [catStyle.color, '#fabd2f', '#d3869b']
        });
        setTimeout(() => setActiveRoutine(id), 400);
    };

    if (activeRoutine) {
        return (
            <WorkoutDetail
                routineId={activeRoutine}
                onBack={() => { setActiveRoutine(null); setStarted(null); }}
            />
        );
    }

    return (
        <div className="page-container">
            <div className="fade-up fade-up-1" style={{ marginBottom: '1.5rem' }}>
                <h1>Home Workouts</h1>
                <p style={{ marginTop: '4px' }}>Daily routines for every level 💪</p>
            </div>

            {/* Filter Tabs */}
            <div className="pill-tabs fade-up fade-up-2" style={{ marginBottom: '1.5rem' }}>
                {filters.map(f => (
                    <div
                        key={f}
                        className={`pill-tab ${activeFilter === f ? 'active' : ''}`}
                        onClick={() => setActiveFilter(f)}
                    >
                        {f}
                    </div>
                ))}
            </div>

            {/* Workout Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredRoutines.map((r, i) => {
                    const style = CATEGORY_STYLES[r.category] ?? CATEGORY_STYLES.CORE;
                    return (
                        <div
                            key={r.id}
                            className={`workout-card fade-up fade-up-${Math.min(i + 3, 6)}`}
                            onClick={() => handleStart(r.id)}
                        >
                            {/* Icon Box */}
                            <div className={`workout-icon-box ${style.bg}`}>
                                <span>{r.emoji}</span>
                            </div>

                            {/* Meta */}
                            <div className="workout-meta">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                                    <h3 style={{ fontSize: '0.93rem' }}>{r.title}</h3>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    {/* Category badge */}
                                    <span className="workout-category-pill" style={{ background: style.pill, color: style.color }}>
                                        {r.category}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--fg4)' }}>⏱ {r.duration}</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--fg4)' }}>🔥 {r.cal}</span>
                                </div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 600, marginTop: '3px' }} className={style.text}>
                                    {r.level}
                                </div>
                            </div>

                            {/* Play Button */}
                            <button
                                className="workout-play"
                                style={started === r.id
                                    ? { background: 'var(--green)', animation: 'none' }
                                    : { background: style.color }}
                                onClick={(e) => { e.stopPropagation(); handleStart(r.id); }}
                            >
                                {started === r.id ? (
                                    <svg viewBox="0 0 24 24">
                                        <path d="M20 6L9 17l-5-5" stroke="var(--bg0-hard)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24">
                                        <polygon points="5 3 19 12 5 21 5 3" fill="var(--bg0-hard)" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
