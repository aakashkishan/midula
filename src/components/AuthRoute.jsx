import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from '../pages/useNavigate';

export default function AuthRoute({ children }) {
    const { user, isOnboarded, loading } = useAuth();
    const navigate = useNavigate();
    const hasNavigated = useRef(false);

    useEffect(() => {
        if (loading || hasNavigated.current) return;
        if (!user) {
            hasNavigated.current = true;
            navigate('/auth/signin');
        } else if (!isOnboarded) {
            hasNavigated.current = true;
            navigate('/auth/onboarding');
        }
    }, [user, isOnboarded, loading, navigate]);

    // Reset navigation lock when onboarding completes
    useEffect(() => {
        if (user && isOnboarded) {
            hasNavigated.current = false;
        }
    }, [user, isOnboarded]);

    if (loading || !user || !isOnboarded) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg0-hard)' }}>
                <div style={{ width: 40, height: 40, border: '3px solid var(--bg2)', borderTop: '3px solid var(--aqua)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    return children;
}
