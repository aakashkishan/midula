import '../App.css';

export default function Recipes() {
    const recipes = [
        { title: 'Millet Dosa', time: '15 min', cal: '180 kcal', emoji: '🥞', color: 'yellow', badge: 'Quick' },
        { title: 'Tofu Tikka', time: '30 min', cal: '220 kcal', emoji: '🍢', color: 'red', badge: 'Protein' },
        { title: 'Paneer Salad', time: '10 min', cal: '150 kcal', emoji: '🥗', color: 'green', badge: 'Light' },
        { title: 'Dal Chilla', time: '20 min', cal: '190 kcal', emoji: '🫓', color: 'orange', badge: 'Fiber' },
        { title: 'Ragi Porridge', time: '15 min', cal: '160 kcal', emoji: '🥣', color: 'purple', badge: 'Millet' },
        { title: 'Tofu Stir-Fry', time: '25 min', cal: '240 kcal', emoji: '🥘', color: 'aqua', badge: 'Protein' },
    ];

    return (
        <div className="page-container">
            <div className="fade-up fade-up-1" style={{ marginBottom: '1.5rem' }}>
                <h1>Healthy Recipes</h1>
                <p style={{ marginTop: '4px' }}>Indian vegetarian meals packed with goodness 🌿</p>
            </div>

            <div className="pill-tabs fade-up fade-up-2" style={{ marginBottom: '1.5rem' }}>
                <div className="pill-tab active">All</div>
                <div className="pill-tab">Quick</div>
                <div className="pill-tab">Protein</div>
                <div className="pill-tab">Millet</div>
            </div>

            <div className="recipe-grid">
                {recipes.map((r, i) => (
                    <div key={i} className={`recipe-card fade-up fade-up-${Math.min(i + 3, 6)}`}>
                        <div className="recipe-icon">{r.emoji}</div>
                        <h3>{r.title}</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.68rem', color: 'var(--fg4)', fontWeight: 500 }}>
                            <span>⏱ {r.time}</span>
                            <span>🔥 {r.cal}</span>
                        </div>
                        <span className={`recipe-badge bg-${r.color} text-${r.color}`}>{r.badge}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
