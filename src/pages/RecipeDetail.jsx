import { useState, useEffect, useRef } from 'react';
import '../App.css';

function NutritionCard({ label, value, unit, color, icon, delay }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), delay);
        return () => clearTimeout(t);
    }, [delay]);

    return (
        <div className={`nutrition-card ${visible ? 'nutrition-visible' : ''}`}>
            <div className={`nutrition-icon-wrap bg-${color}`}>
                <span>{icon}</span>
            </div>
            <div className="nutrition-info">
                <span className="nutrition-value">
                    {value}<small>{unit}</small>
                </span>
                <span className="nutrition-label">{label}</span>
            </div>
        </div>
    );
}

function StepItem({ step, number, total, checked, onToggle, delay }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), delay);
        return () => clearTimeout(t);
    }, [delay]);

    return (
        <div
            className={`recipe-step ${visible ? 'step-visible' : ''} ${checked ? 'step-checked' : ''}`}
            style={{ '--step-delay': `${delay}ms` }}
        >
            <button
                className={`step-checkbox ${checked ? 'checked' : ''}`}
                onClick={onToggle}
                aria-label={`Mark step ${number} as done`}
            >
                {checked ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                ) : (
                    <span>{number}</span>
                )}
            </button>
            <div className="step-content">
                <p>{step}</p>
            </div>
            {number < total && <div className="step-connector" />}
        </div>
    );
}

function IngredientItem({ ingredient, checked, onToggle }) {
    return (
        <button
            className={`ingredient-item ${checked ? 'ingredient-checked' : ''}`}
            onClick={onToggle}
        >
            <div className={`ingredient-check ${checked ? 'checked' : ''}`}>
                {checked && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                )}
            </div>
            <span className={`ingredient-text ${checked ? 'checked' : ''}`}>{ingredient}</span>
        </button>
    );
}

function CookingTimer() {
    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        let interval;
        if (running) {
            interval = setInterval(() => setSeconds((s) => s + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [running]);

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return (
        <div className="cooking-timer">
            <div className="timer-display">
                <span>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
            </div>
            <button
                className={`timer-btn ${running ? 'timer-running' : ''}`}
                onClick={() => setRunning(!running)}
            >
                {running ? '⏸ Pause' : '▶ Start Timer'}
            </button>
            {running && (
                <button className="timer-reset-btn" onClick={() => { setRunning(false); setSeconds(0); }}>
                    ↺ Reset
                </button>
            )}
        </div>
    );
}

export default function RecipeDetail({ recipe, onBack, onFavorite, isFavorite }) {
    const [activeTab, setActiveTab] = useState('steps');
    const [checkedSteps, setCheckedSteps] = useState({});
    const [checkedIngredients, setCheckedIngredients] = useState({});
    const [servingsMultiplier, setServingsMultiplier] = useState(1);
    const [imageLoaded, setImageLoaded] = useState(false);
    const heroRef = useRef(null);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const completedSteps = Object.values(checkedSteps).filter(Boolean).length;
    const totalSteps = recipe.steps.length;
    const progressPct = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    const diffColor = recipe.difficulty === 'Easy' ? 'aqua' : recipe.difficulty === 'Medium' ? 'yellow' : 'red';

    const parseNumber = (str) => {
        const match = str.match(/^([\d./½¼¾⅓⅔]+)\s*/);
        if (!match) return null;
        let numStr = match[1];
        const fractions = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 0.333, '⅔': 0.667 };
        if (fractions[numStr] !== undefined) return fractions[numStr];
        if (numStr.includes('/')) {
            const [a, b] = numStr.split('/').map(Number);
            return a / b;
        }
        return parseFloat(numStr);
    };

    const scaleIngredient = (ing) => {
        if (servingsMultiplier === 1) return ing;
        const num = parseNumber(ing);
        if (num === null) return ing;
        const scaled = num * servingsMultiplier;
        const display = scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(1).replace(/\.0$/, '');
        return ing.replace(/^[\d./½¼¾⅓⅔]+/, display);
    };

    const calPerServing = recipe.cal ? (() => {
        const num = parseInt(recipe.cal);
        return isNaN(num) ? recipe.cal : `${Math.round(num * servingsMultiplier)} kcal`;
    })() : recipe.cal;

    return (
        <div className="recipe-detail-page">
            {/* Hero Section */}
            <div
                ref={heroRef}
                className={`recipe-hero ${imageLoaded ? 'hero-loaded' : ''}`}
            >
                <div className="hero-pattern" />
                <button className="hero-back-btn" onClick={onBack} aria-label="Go back">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <button
                    className="hero-fav-btn"
                    onClick={() => onFavorite && onFavorite(recipe.id)}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                    {isFavorite ? '❤️' : '🤍'}
                </button>
                <div className="hero-content">
                    <span className="hero-emoji">{recipe.emoji}</span>
                    <div className="hero-badges">
                        <span className={`recipe-badge bg-${diffColor} text-${diffColor}`}>{recipe.difficulty}</span>
                        <span className="recipe-badge bg-yellow text-yellow">{recipe.category}</span>
                    </div>
                    <h1 className="hero-title">{recipe.name}</h1>
                    <p className="hero-desc">{recipe.description}</p>
                </div>
                <div className="hero-wave" />
            </div>

            {/* Quick Stats */}
            <div className="recipe-stats-row">
                <div className="recipe-stat fade-up fade-up-1">
                    <span className="stat-emoji">⏱</span>
                    <span className="stat-val">{recipe.time}</span>
                    <span className="stat-lbl">Cook Time</span>
                </div>
                <div className="recipe-stat fade-up fade-up-2">
                    <span className="stat-emoji">🔥</span>
                    <span className="stat-val">{calPerServing}</span>
                    <span className="stat-lbl">Calories</span>
                </div>
                <div className="recipe-stat fade-up fade-up-3">
                    <span className="stat-emoji">🍽️</span>
                    <span className="stat-val">{recipe.servings}</span>
                    <span className="stat-lbl">Servings</span>
                </div>
            </div>

            {/* Nutrition Cards */}
            {recipe.protein && recipe.carbs && recipe.fat && (
                <div className="nutrition-grid">
                    <NutritionCard label="Protein" value={recipe.protein} unit="" color="aqua" icon="💪" delay={100} />
                    <NutritionCard label="Carbs" value={recipe.carbs} unit="" color="yellow" icon="⚡" delay={200} />
                    <NutritionCard label="Fat" value={recipe.fat} unit="" color="orange" icon="🫒" delay={300} />
                </div>
            )}

            {/* Servings Scaler */}
            <div className="servings-scaler fade-up">
                <span className="scaler-label">Adjust servings:</span>
                <div className="scaler-controls">
                    <button
                        className="scaler-btn"
                        disabled={servingsMultiplier <= 0.5}
                        onClick={() => setServingsMultiplier((m) => Math.max(0.5, m - 0.5))}
                    >
                        −
                    </button>
                    <span className="scaler-value">{Math.round(recipe.servings * servingsMultiplier)}</span>
                    <button
                        className="scaler-btn"
                        disabled={servingsMultiplier >= 4}
                        onClick={() => setServingsMultiplier((m) => Math.min(4, m + 0.5))}
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Cooking Timer */}
            <CookingTimer />

            {/* Tab Navigation */}
            <div className="recipe-tabs">
                <button
                    className={`recipe-tab ${activeTab === 'steps' ? 'active' : ''}`}
                    onClick={() => setActiveTab('steps')}
                >
                    📋 Steps
                    {completedSteps > 0 && (
                        <span className="tab-progress-dot">{completedSteps}/{totalSteps}</span>
                    )}
                </button>
                <button
                    className={`recipe-tab ${activeTab === 'ingredients' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ingredients')}
                >
                    🥕 Ingredients
                    <span className="tab-count">{recipe.ingredients.length}</span>
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'steps' && (
                <div className="recipe-steps-section">
                    {/* Progress Bar */}
                    <div className="steps-progress-wrap">
                        <div className="steps-progress-bar">
                            <div
                                className="steps-progress-fill"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                        <span className="steps-progress-text">
                            {completedSteps === totalSteps ? '🎉 All done!' : `${completedSteps} of ${totalSteps} steps`}
                        </span>
                    </div>

                    {/* Completion Banner */}
                    {completedSteps === totalSteps && totalSteps > 0 && (
                        <div className="completion-banner">
                            <span className="completion-emoji">🎊</span>
                            <h3>You did it!</h3>
                            <p>All steps completed. Enjoy your meal!</p>
                        </div>
                    )}

                    {/* Steps List */}
                    <div className="steps-list">
                        {recipe.steps.map((step, i) => (
                            <StepItem
                                key={i}
                                step={step}
                                number={i + 1}
                                total={totalSteps}
                                checked={!!checkedSteps[i]}
                                onToggle={() => setCheckedSteps((prev) => ({ ...prev, [i]: !prev[i] }))}
                                delay={100 + i * 80}
                            />
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'ingredients' && (
                <div className="ingredients-section fade-up">
                    <div className="ingredients-header">
                        <h3>What you'll need</h3>
                        <span className="ingredient-count">{recipe.ingredients.length} items</span>
                    </div>
                    <div className="ingredients-list">
                        {recipe.ingredients.map((ing, i) => (
                            <IngredientItem
                                key={i}
                                ingredient={scaleIngredient(ing)}
                                checked={!!checkedIngredients[i]}
                                onToggle={() => setCheckedIngredients((prev) => ({ ...prev, [i]: !prev[i] }))}
                            />
                        ))}
                    </div>

                    {servingsMultiplier !== 1 && (
                        <p className="scaling-note">
                            📐 Ingredients scaled to {Math.round(recipe.servings * servingsMultiplier)} servings
                        </p>
                    )}
                </div>
            )}

            {/* Bottom CTA */}
            <div className="recipe-bottom-cta fade-up">
                <div className="cta-card">
                    <span className="cta-emoji">💡</span>
                    <h3>Cooking Tips</h3>
                    <ul className="tips-list">
                        <li>Read all steps before starting</li>
                        <li>Prep all ingredients before cooking (mise en place)</li>
                        <li>Use the timer to track cooking durations</li>
                        <li>Adjust spice levels to your preference</li>
                    </ul>
                </div>
            </div>

            {/* Bottom padding for nav */}
            <div style={{ height: '2rem' }} />
        </div>
    );
}
