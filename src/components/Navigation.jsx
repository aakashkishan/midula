import { Droplet, Dumbbell, Target, Utensils, MessageCircle } from 'lucide-react';
import './Navigation.css';

export default function Navigation({ activeTab, setActiveTab }) {
    const tabs = [
        { id: 'dashboard', icon: Droplet, label: 'Tracker' },
        { id: 'workouts', icon: Dumbbell, label: 'Workouts' },
        { id: 'goals', icon: Target, label: 'Goals' },
        { id: 'recipes', icon: Utensils, label: 'Recipes' },
        { id: 'chat', icon: MessageCircle, label: 'Coach' },
    ];

    return (
        <nav className="bottom-nav">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                >
                    <tab.icon strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                    <span>{tab.label}</span>
                </button>
            ))}
        </nav>
    );
}
