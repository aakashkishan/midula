import './App.css';
import { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import Goals from './pages/Goals';
import Recipes from './pages/Recipes';
import Chat from './pages/Chat';

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard key="dashboard" />;
            case 'workouts': return <Workouts key="workouts" />;
            case 'goals': return <Goals key="goals" />;
            case 'recipes': return <Recipes key="recipes" />;
            case 'chat': return <Chat key="chat" />;
            default: return <Dashboard key="dashboard" />;
        }
    };

    return (
        <>
            <main style={{ paddingBottom: '72px', width: '100%' }}>
                {renderContent()}
            </main>
            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </>
    );
}

export default App;
