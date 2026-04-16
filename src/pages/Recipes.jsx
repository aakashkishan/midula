import { useState } from 'react';
import { recipes } from '../data/recipes';
import RecipeDetail from './RecipeDetail';
import '../App.css';

export default function Recipes() {
    const [activeRecipe, setActiveRecipe] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');

    const handleStart = (id) => {
        setActiveRecipe(id);
    };

    if (activeRecipe) {
        const recipeData = recipes.find(r => r.id === activeRecipe);
        return (
            <RecipeDetail
                recipe={recipeData}
                onBack={() => setActiveRecipe(null)}
            />
        );
    }

    const filters = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Drink'];
    
    const filteredRecipes = activeFilter === 'All' 
        ? recipes 
        : recipes.filter(r => r.category === activeFilter);

    return (
        <div className="page-container">
            <div className="fade-up fade-up-1" style={{ marginBottom: '1.5rem' }}>
                <h1>Healthy Recipes</h1>
                <p style={{ marginTop: '4px' }}>Indian vegetarian meals packed with goodness 🌿</p>
            </div>

            <div className="pill-tabs fade-up fade-up-2" style={{ marginBottom: '1.5rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                {filters.map(f => (
                    <div 
                        key={f} 
                        className={`pill-tab ${activeFilter === f ? 'active' : ''}`}
                        onClick={() => setActiveFilter(f)}
                        style={{cursor: 'pointer'}}
                    >
                        {f}
                    </div>
                ))}
            </div>

            <div className="recipe-grid">
                {filteredRecipes.map((r, i) => {
                    const color = r.difficulty === 'Easy' ? 'aqua' : r.difficulty === 'Medium' ? 'yellow' : 'red';
                    
                    return (
                        <div 
                            key={r.id} 
                            className={`recipe-card fade-up fade-up-${Math.min(i + 3, 6)}`}
                            onClick={() => handleStart(r.id)}
                            style={{cursor: 'pointer'}}
                        >
                            <div className="recipe-icon">{r.emoji}</div>
                            <h3>{r.name}</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.68rem', color: 'var(--fg4)', fontWeight: 500 }}>
                                <span>⏱ {r.time}</span>
                                <span>🔥 {r.cal}</span>
                            </div>
                            <span className={`recipe-badge bg-${color} text-${color}`}>{r.difficulty}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
