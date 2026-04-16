import { useState } from 'react';
import { Droplet, Clock, Utensils, Moon, Plus, Minus } from 'lucide-react';
import confetti from 'canvas-confetti';
import '../App.css';

export default function Dashboard() {
    const [water, setWater] = useState(5);
    const [workout, setWorkout] = useState(12);
    const [food, setFood] = useState(1800);
    const [sleep, setSleep] = useState(9);
    const maxWater = 8;

    const addWater = () => {
        if (water < maxWater) {
            setWater(w => w + 1);
            confetti({ particleCount: 40, spread: 55, origin: { y: 0.55 }, colors: ['#8ec07c', '#fabd2f', '#b8bb26'] });
        }
    };

    const waterPercent = (water / maxWater) * 100;
    const circumference = 2 * Math.PI * 40;
    const waterOffset = circumference - (waterPercent / 100) * circumference;

    const stats = [
        { icon: Clock, label: 'Workout', sub: 'Daily session', value: `${workout} min`, color: 'orange', val: workout, set: setWorkout, step: 5 },
        { icon: Droplet, label: 'Water', sub: 'Stay hydrated', value: `${water} L`, color: 'aqua', val: water, set: setWater, step: 1, max: maxWater },
        { icon: Utensils, label: 'Food', sub: 'Nutrition intake', value: `${food} kcal`, color: 'yellow', val: food, set: setFood, step: 100 },
        { icon: Moon, label: 'Sleep', sub: 'Last night', value: `${sleep} hr`, color: 'purple', val: sleep, set: setSleep, step: 1 },
    ];

    return (
        <div className="page-container">

            {/* Greeting */}
            <div className="fade-up fade-up-1" style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--fg4)', marginBottom: '2px' }}>Good evening</p>
                <h1 style={{ fontSize: '1.6rem' }}>Hello, Jane 👋</h1>
            </div>

            {/* Pill Tabs */}
            <div className="pill-tabs fade-up fade-up-2" style={{ marginBottom: '1.5rem' }}>
                <div className="pill-tab active">Today</div>
                <div className="pill-tab">This Week</div>
                <div className="pill-tab">This Month</div>
            </div>

            {/* Water Ring + Workout Card */}
            <div className="fade-up fade-up-3" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* Water Ring */}
                <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.25rem 0.75rem' }} onClick={addWater}>
                    <div className="progress-ring-wrap">
                        <svg width="140" height="140" viewBox="0 0 100 100">
                            <circle className="progress-ring-bg" cx="50" cy="50" r="40" />
                            <circle className="progress-ring-fill" cx="50" cy="50" r="40" strokeDashoffset={waterOffset} />
                        </svg>
                        <div className="progress-ring-center">
                            <div className="progress-ring-value">{water}<span style={{ fontSize: '1rem', color: 'var(--fg4)' }}>/{maxWater}</span></div>
                            <div className="progress-ring-label">Glasses</div>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--fg4)', marginTop: '0.5rem', textAlign: 'center' }}>Tap to add water</p>
                </div>

                {/* Quick Stats Stack */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div className="card" style={{ padding: '0.75rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                        <div className="stat-icon-circle bg-orange" style={{ width: '34px', height: '34px', borderRadius: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🧘</span>
                        </div>
                        <div><div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--fg)' }}>Cardio</div><div style={{ fontSize: '0.62rem', color: 'var(--fg4)' }}>15 min</div></div>
                    </div>
                    <div className="card" style={{ padding: '0.75rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                        <div className="stat-icon-circle bg-purple" style={{ width: '34px', height: '34px', borderRadius: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>💪</span>
                        </div>
                        <div><div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--fg)' }}>Core Flow</div><div style={{ fontSize: '0.62rem', color: 'var(--fg4)' }}>20 min</div></div>
                    </div>
                    <div className="card" style={{ padding: '0.75rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                        <div className="stat-icon-circle bg-aqua" style={{ width: '34px', height: '34px', borderRadius: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🏃‍♀️</span>
                        </div>
                        <div><div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--fg)' }}>HIIT</div><div style={{ fontSize: '0.62rem', color: 'var(--fg4)' }}>10 min</div></div>
                    </div>
                </div>
            </div>

            {/* Daily Info */}
            <div className="section-header fade-up fade-up-4">
                <span className="section-title">Daily Info</span>
            </div>

            <div className="card fade-up fade-up-5" style={{ padding: '0.5rem 1rem' }}>
                {stats.map((s, i) => (
                    <div className="stat-row" key={i}>
                        <div className={`stat-icon-circle bg-${s.color}`}>
                            <s.icon stroke={`var(--${s.color})`} strokeWidth={2.5} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-info-label">{s.label}</div>
                            <div className="stat-info-sub">{s.sub}</div>
                        </div>
                        <div className={`stat-value text-${s.color}`}>{s.value}</div>
                        <div className="stat-controls">
                            <button className="ctrl-btn" onClick={() => s.set(v => Math.max(0, v - s.step))}>
                                <Minus size={14} />
                            </button>
                            <button className="ctrl-btn" onClick={() => { s.set(v => s.max ? Math.min(s.max, v + s.step) : v + s.step); if (s.label === 'Water') addWater(); }}>
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
