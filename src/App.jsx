import './App.css';
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { setNavigate } from './pages/useNavigate';

import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import Goals from './pages/Goals';
import Recipes from './pages/Recipes';
import Chat from './pages/Chat';

import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import OnboardingPage from './pages/auth/OnboardingPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [currentPath, setCurrentPath] = useState('/');
    const { user, loading, isDemo, isOnboarded } = useAuth();

    useEffect(() => {
        setNavigate((path) => {
            // Check if URL updates are needed (window.history logic could be here, but we'll stick to state for now)
            setCurrentPath(path);
        });
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg0)' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
        );
    }

    // Route Guard Logic
    if (!user && !isDemo && !currentPath.startsWith('/auth')) {
        return <SignInPage />;
    } else if ((user || isDemo) && !isOnboarded && currentPath !== '/auth/onboarding') {
        return <OnboardingPage />;
    } else if ((user || isDemo) && isOnboarded && currentPath.startsWith('/auth')) {
        // If logged in & onboarded, bounce off auth routes to home
        setTimeout(() => setCurrentPath('/'), 0);
        return null;
    }

    // Render exact Auth routes based on path
    if (currentPath.startsWith('/auth')) {
        switch (currentPath) {
            case '/auth/signin': return <SignInPage />;
            case '/auth/signup': return <SignUpPage />;
            case '/auth/onboarding': return <OnboardingPage />;
            case '/auth/forgot': return <ForgotPasswordPage />;
            default: return <SignInPage />;
        }
    }

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
