import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

const DEMO_USER = {
    id: 'demo-user',
    email: 'demo@midula.app',
};

const DEMO_PROFILE = {
    id: 'demo-user',
    full_name: 'Demo User',
    fitness_level: 'beginner',
    diet_type: 'vegetarian',
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDemo, setIsDemo] = useState(false);

    const fetchProfile = useCallback(async (userId) => {
        if (!userId) { setProfile(null); return; }
        try {
            const { data } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single();
            setProfile(data);
        } catch {
            setProfile(null);
        }
    }, []);

    useEffect(() => {
        // Check for demo mode first
        const demoMode = localStorage.getItem('midula_demo_mode');
        if (demoMode === 'true') {
            setUser(DEMO_USER);
            setProfile(DEMO_PROFILE);
            setIsDemo(true);
            setLoading(false);
            return;
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            else { setProfile(null); setLoading(false); }
        });

        return () => subscription.unsubscribe();
    }, [fetchProfile]);

    const enableDemoMode = useCallback(() => {
        localStorage.setItem('midula_demo_mode', 'true');
        setUser(DEMO_USER);
        setProfile(DEMO_PROFILE);
        setIsDemo(true);
        setLoading(false);
    }, []);

    const disableDemoMode = useCallback(() => {
        localStorage.removeItem('midula_demo_mode');
    }, []);

    const signIn = useCallback(async (email, password) => {
        disableDemoMode();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { user: data?.user, error };
    }, [disableDemoMode]);

    const signUp = useCallback(async (email, password) => {
        disableDemoMode();
        const { data, error } = await supabase.auth.signUp({ email, password });
        return { user: data?.user, error };
    }, [disableDemoMode]);

    const signOut = useCallback(async () => {
        disableDemoMode();
        await supabase.auth.signOut();
    }, [disableDemoMode]);

    const resetPassword = useCallback(async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });
        return { error };
    }, []);

    const updateProfile = useCallback(async (data) => {
        if (!user) return { error: new Error('No user') };
        if (isDemo) {
            setProfile(prev => ({ ...prev, ...data }));
            return { error: null };
        }
        const { error } = await supabase.from('user_profiles').upsert({
            id: user.id,
            ...data,
            updated_at: new Date().toISOString(),
        });
        if (!error) {
            await fetchProfile(user.id);
        }
        return { error };
    }, [user, isDemo, fetchProfile]);

    const value = {
        user, session, profile, loading, isDemo,
        isOnboarded: isDemo || !!profile?.full_name,
        signIn, signUp, signOut, resetPassword, updateProfile, enableDemoMode,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
