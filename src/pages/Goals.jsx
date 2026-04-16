import '../App.css';

export default function Goals() {
    const goals = [
        { title: 'Drink 8 Glasses Daily', current: 5, target: 8, unit: 'glasses', color: 'aqua', emoji: '💧' },
        { title: 'Complete 5 Workouts/Week', current: 3, target: 5, unit: 'sessions', color: 'orange', emoji: '🔥' },
        { title: 'Eat 2000 kcal Daily', current: 1800, target: 2000, unit: 'kcal', color: 'yellow', emoji: '🥗' },
        { title: 'Sleep 8 Hours Nightly', current: 7, target: 8, unit: 'hours', color: 'purple', emoji: '🌙' },
    ];

    return (
        <div className="page-container">
            <div className="fade-up fade-up-1" style={{ marginBottom: '1.5rem' }}>
                <h1>Your Goals</h1>
                <p style={{ marginTop: '4px' }}>Stay focused and track your progress 🎯</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {goals.map((g, i) => {
                    const pct = Math.round((g.current / g.target) * 100);
                    return (
                        <div key={i} className={`goal-card fade-up fade-up-${Math.min(i + 2, 6)}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div className={`stat-icon-circle bg-${g.color}`} style={{ width: '42px', height: '42px', fontSize: '1.3rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {g.emoji}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--fg)' }}>{g.title}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--fg4)', marginTop: '2px' }}>
                                        <span className={`text-${g.color}`} style={{ fontWeight: 700 }}>{g.current}</span> / {g.target} {g.unit}
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '800' }} className={`text-${g.color}`}>{pct}%</div>
                            </div>
                            <div className="goal-progress-bar-wrap">
                                <div className={`goal-progress-bar-fill`} style={{ width: `${pct}%`, background: `var(--${g.color})` }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <button className="btn-primary fade-up fade-up-6">+ Add New Goal</button>
        </div>
    );
}
