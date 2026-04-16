/**
 * useUserData.js - Comprehensive data hooks for all user tracking tables.
 *
 * Each hook:
 * - Uses the Supabase client from src/lib/supabase
 * - Handles unauthenticated state gracefully (returns empty data, no errors)
 * - Caches data with useState
 * - Exposes loading / error states
 * - Auto-refetches cache after mutations
 * - Includes retry logic with exponential backoff for failed requests
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

/* ========================================================================== */
/*  Shared helpers                                                            */
/* ========================================================================== */

/**
 * Get the current auth user ID (returns null if not signed in).
 */
async function getUserId() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
}

/**
 * Retry a Supabase operation with exponential backoff.
 * @param {() => Promise} fn       - Async function to retry.
 * @param {number}        maxRetries
 * @param {number}        baseDelay  - milliseconds.
 * @returns {Promise<any>}
 */
async function withRetry(fn, maxRetries = 3, baseDelay = 500) {
    let attempt = 0;
    while (true) {
        try {
            return await fn();
        } catch (err) {
            attempt++;
            if (attempt >= maxRetries) throw err;
            const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 200;
            await new Promise((r) => setTimeout(r, delay));
        }
    }
}

/**
 * Build a Supabase query, execute it, and return { data, error, count }.
 * Wraps with retry logic.
 */
async function runQuery(query) {
    return withRetry(async () => {
        const { data, error, count } = await query;
        if (error) throw error;
        return { data, error: null, count };
    });
}

/* ========================================================================== */
/*  1. useUserProfile                                                          */
/* ========================================================================== */

/**
 * @returns {{ profile: object|null, loading: boolean, error: string|null, updateProfile: (data: object) => Promise<void> }}
 */
export function useUserProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProfile = useCallback(async () => {
        const uid = await getUserId();
        if (!uid) { setProfile(null); setLoading(false); return; }
        try {
            setLoading(true);
            setError(null);
            const { data } = await runQuery(
                supabase.from('user_profiles').select('*').eq('id', uid).maybeSingle()
            );
            setProfile(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProfile(); }, [fetchProfile]);

    const updateProfile = useCallback(async (data) => {
        const uid = await getUserId();
        if (!uid) return;
        try {
            setError(null);
            const { data: updated } = await runQuery(
                supabase
                    .from('user_profiles')
                    .upsert({ id: uid, ...data, updated_at: new Date().toISOString() })
                    .select()
                    .maybeSingle()
            );
            setProfile(updated);
        } catch (e) {
            setError(e.message);
        }
    }, []);

    return { profile, loading, error, updateProfile, refetch: fetchProfile };
}

/* ========================================================================== */
/*  2. useWorkoutSessions                                                      */
/* ========================================================================== */

/**
 * @returns {{ sessions: array, loading: boolean, error: string|null, createSession: (data: object) => Promise<void>, updateSession: (id: string, data: object) => Promise<void>, deleteSession: (id: string) => Promise<void>, getSessionsByDateRange: (start: string, end: string) => Promise<void> }}
 */
export function useWorkoutSessions() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSessions = useCallback(async (startDate, endDate) => {
        const uid = await getUserId();
        if (!uid) { setSessions([]); setLoading(false); return; }
        try {
            setLoading(true);
            setError(null);
            let query = supabase.from('workout_sessions').select('*').eq('user_id', uid).order('date', { ascending: false });
            if (startDate) query = query.gte('date', startDate);
            if (endDate) query = query.lte('date', endDate);
            const { data } = await runQuery(query);
            setSessions(data || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSessions(); }, [fetchSessions]);

    const createSession = useCallback(async (data) => {
        const uid = await getUserId();
        if (!uid) return;
        try {
            setError(null);
            const { data: created } = await runQuery(
                supabase.from('workout_sessions').insert({ user_id: uid, ...data }).select().single()
            );
            setSessions((prev) => [created, ...prev]);
        } catch (e) {
            setError(e.message);
        }
    }, []);

    const updateSession = useCallback(async (id, data) => {
        const uid = await getUserId();
        if (!uid) return;
        try {
            setError(null);
            const { data: updated } = await runQuery(
                supabase.from('workout_sessions').update(data).eq('id', id).eq('user_id', uid).select().single()
            );
            setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
        } catch (e) {
            setError(e.message);
        }
    }, []);

    const deleteSession = useCallback(async (id) => {
        const uid = await getUserId();
        if (!uid) return;
        try {
            setError(null);
            await runQuery(
                supabase.from('workout_sessions').delete().eq('id', id).eq('user_id', uid)
            );
            setSessions((prev) => prev.filter((s) => s.id !== id));
        } catch (e) {
            setError(e.message);
        }
    }, []);

    const getSessionsByDateRange = useCallback(
        (start, end) => fetchSessions(start, end),
        [fetchSessions]
    );

    return { sessions, loading, error, createSession, updateSession, deleteSession, getSessionsByDateRange, refetch: fetchSessions };
}

/* ========================================================================== */
/*  3. useMealLogs                                                             */
/* ========================================================================== */

/**
 * @returns {{ meals: array, loading: boolean, error: string|null, createMeal: (data: object) => Promise<void>, updateMeal: (id: string, data: object) => Promise<void>, deleteMeal: (id: string) => Promise<void>, getMealsByDate: (date: string) => Promise<void>, getMealsByDateRange: (start: string, end: string) => Promise<void> }}
 */
export function useMealLogs() {
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMeals = useCallback(async (date, mealType, startDate, endDate) => {
        const uid = await getUserId();
        if (!uid) { setMeals([]); setLoading(false); return; }
        try {
            setLoading(true);
            setError(null);
            let query = supabase.from('meal_logs').select('*').eq('user_id', uid).order('time_logged', { ascending: false });
            if (date) query = query.eq('date', date);
            if (startDate) query = query.gte('date', startDate);
            if (endDate) query = query.lte('date', endDate);
            if (mealType) query = query.eq('meal_type', mealType);
            const { data } = await runQuery(query);
            setMeals(data || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMeals(); }, [fetchMeals]);

    const createMeal = useCallback(async (data) => {
        const uid = await getUserId();
        if (!uid) return;
        try {
            setError(null);
            const { data: created } = await runQuery(
                supabase.from('meal_logs').insert({ user_id: uid, ...data }).select().single()
            );
            setMeals((prev) => [created, ...prev]);
        } catch (e) {
            setError(e.message);
        }
    }, []);

    const updateMeal = useCallback(async (id, data) => {
        const uid = await getUserId();
        if (!uid) return;
        try {
            setError(null);
            const { data: updated } = await runQuery(
                supabase.from('meal_logs').update(data).eq('id', id).eq('user_id', uid).select().single()
            );
            setMeals((prev) => prev.map((m) => (m.id === id ? updated : m)));
        } catch (e) {
            setError(e.message);
        }
    }, []);

    const deleteMeal = useCallback(async (id) => {
        const uid = await getUserId();
        if (!uid) return;
        try {
            setError(null);
            await runQuery(
                supabase.from('meal_logs').delete().eq('id', id).eq('user_id', uid)
            );
            setMeals((prev) => prev.filter((m) => m.id !== id));
        } catch (e) {
            setError(e.message);
        }
    }, []);

    const getMealsByDate = useCallback((date) => fetchMeals(date), [fetchMeals]);
    const getMealsByDateRange = useCallback((start, end) => fetchMeals(null, null, start, end), [fetchMeals]);

    return { meals, loading, error, createMeal, updateMeal, deleteMeal, getMealsByDate, getMealsByDateRange, refetch: fetchMeals };
}

/* ========================================================================== */
/*  4. useBodyMetrics                                                          */
/* ========================================================================== */

/**
 * @returns {{ metrics: array, loading: boolean, error: string|null, createMetric: (data: object) => Promise<void>, getMetricsByDateRange: (start: string, end: string) => Promise<void> }}
 */
export function useBodyMetrics() {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMetrics = useCallback(async (startDate, endDate) => {
        const uid = await getUserId();
        if (!uid) { setMetrics([]); setLoading(false); return; }
        try {
            setLoading(true);
            setError(null);
            let query = supabase.from('body_metrics').select('*').eq('user_id', uid).order('date', { ascending: false });
            if (startDate) query = query.gte('date', startDate);
            if (endDate) query = query.lte('date', endDate);
            const { data } = await runQuery(query);
            setMetrics(data || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

    const createMetric = useCallback(async (data) => {
        const uid = await getUserId();
        if (!uid) return;
        try {
            setError(null);
            const { data: created } = await runQuery(
                supabase.from('body_metrics').insert({ user_id: uid, ...data }).select().single()
            );
            setMetrics((prev) => [created, ...prev]);
        } catch (e) {
            setError(e.message);
        }
    }, []);

    const getMetricsByDateRange = useCallback(
        (start, end) => fetchMetrics(start, end),
        [fetchMetrics]
    );

    return { metrics, loading, error, createMetric, getMetricsByDateRange, refetch: fetchMetrics };
}

/* ========================================================================== */
/*  5. useSleepLogs                                                            */
/* ========================================================================== */

/**
 * @returns {{ sleepLogs: array, loading: boolean, error: string|null, createSleepLog: (data: object) => Promise<void>, getSleepByDateRange: (start: string, end: string) => Promise<void> }}
 */
export function useSleepLogs() {
    const [sleepLogs, setSleepLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSleep = useCallback(async (startDate, endDate) => {
        const uid = await getUserId();
        if (!uid) { setSleepLogs([]); setLoading(false); return; }
        try {
            setLoading(true);
            setError(null);
            let query = supabase.from('sleep_logs').select('*').eq('user_id', uid).order('date', { ascending: false });
            if (startDate) query = query.gte('date', startDate);
            if (endDate) query = query.lte('date', endDate);
            const { data } = await runQuery(query);
            setSleepLogs(data || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSleep(); }, [fetchSleep]);

    const createSleepLog = useCallback(async (data) => {
        const uid = await getUserId();
        if (!uid) return;
        try {
            setError(null);
            const { data: created } = await runQuery(
                supabase.from('sleep_logs').insert({ user_id: uid, ...data }).select().single()
            );
            setSleepLogs((prev) => [created, ...prev]);
        } catch (e) {
            setError(e.message);
        }
    }, []);

    const getSleepByDateRange = useCallback(
        (start, end) => fetchSleep(start, end),
        [fetchSleep]
    );

    return { sleepLogs, loading, error, createSleepLog, getSleepByDateRange, refetch: fetchSleep };
}

/* ========================================================================== */
/*  6. useWaterLogs                                                            */
/* ========================================================================== */

/**
 * @returns {{ waterLogs: array, loading: boolean, error: string|null, addWater: (amount: number) => Promise<void>, getWaterByDate: (date: string) => Promise<number>, getTodayWater: () => Promise<number> }}
 */
export function useWaterLogs() {
    const [waterLogs, setWaterLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWater = useCallback(async (date) => {
        const uid = await getUserId();
        if (!uid) { setWaterLogs([]); setLoading(false); return; }
        try {
            setLoading(true);
            setError(null);
            let query = supabase.from('water_logs').select('*').eq('user_id', uid).order('time_logged', { ascending: false });
            if (date) query = query.eq('date', date);
            const { data } = await runQuery(query);
            setWaterLogs(data || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchWater(); }, [fetchWater]);

    const addWater = useCallback(async (amount = 250) => {
        const uid = await getUserId();
        if (!uid) return;
        try {
            setError(null);
            const today = new Date().toISOString().split('T')[0];
            const { data: created } = await runQuery(
                supabase.from('water_logs').insert({ user_id: uid, date: today, amount_ml: amount }).select().single()
            );
            setWaterLogs((prev) => [created, ...prev]);
        } catch (e) {
            setError(e.message);
        }
    }, []);

    const getWaterByDate = useCallback(async (date) => {
        const uid = await getUserId();
        if (!uid) return 0;
        const { data } = await runQuery(
            supabase.from('water_logs').select('amount_ml').eq('user_id', uid).eq('date', date)
        );
        return (data || []).reduce((sum, r) => sum + (r.amount_ml || 0), 0);
    }, []);

    const getTodayWater = useCallback(async () => {
        const today = new Date().toISOString().split('T')[0];
        return getWaterByDate(today);
    }, [getWaterByDate]);

    return { waterLogs, loading, error, addWater, getWaterByDate, getTodayWater, refetch: fetchWater };
}

/* ========================================================================== */
/*  7. useMoodLogs                                                             */
/* ========================================================================== */

/**
 * @returns {{ moodLogs: array, loading: boolean, error: string|null, logMood: (data: object) => Promise<void>, getMoodByDateRange: (start: string, end: string) => Promise<void> }}
 */
export function useMoodLogs() {
    const [moodLogs, setMoodLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMoods = useCallback(async (startDate, endDate) => {
        const uid = await getUserId();
        if (!uid) { setMoodLogs([]); setLoading(false); return; }
        try {
            setLoading(true);
            setError(null);
            let query = supabase.from('mood_logs').select('*').eq('user_id', uid).order('logged_at', { ascending: false });
            if (startDate) query = query.gte('date', startDate);
            if (endDate) query = query.lte('date', endDate);
            const { data } = await runQuery(query);
            setMoodLogs(data || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMoods(); }, [fetchMoods]);

    const logMood = useCallback(async (data) => {
        const uid = await getUserId();
        if (!uid) return;
        try {
            setError(null);
            const { data: created } = await runQuery(
                supabase.from('mood_logs').insert({ user_id: uid, ...data }).select().single()
            );
            setMoodLogs((prev) => [created, ...prev]);
        } catch (e) {
            setError(e.message);
        }
    }, []);

    const getMoodByDateRange = useCallback(
        (start, end) => fetchMoods(start, end),
        [fetchMoods]
    );

    return { moodLogs, loading, error, logMood, getMoodByDateRange, refetch: fetchMoods };
}

/* ========================================================================== */
/*  8. useStepCounts                                                           */
/* ========================================================================== */

/**
 * @returns {{ steps: array, loading: boolean, error: string|null, updateSteps: (data: object) => Promise<void>, getStepsByDate: (date: string) => Promise<void> }}
 */
export function useStepCounts() {
    const [steps, setSteps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSteps = useCallback(async (date) => {
        const uid = await getUserId();
        if (!uid) { setSteps([]); setLoading(false); return; }
        try {
            setLoading(true);
            setError(null);
            let query = supabase.from('step_counts').select('*').eq('user_id', uid).order('date', { ascending: false });
            if (date) query = query.eq('date', date);
            const { data } = await runQuery(query);
            setSteps(data || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSteps(); }, [fetchSteps]);

    const updateSteps = useCallback(async (data) => {
        const uid = await getUserId();
        if (!uid) return;
        try {
            setError(null);
            const { data: dateVal } = data;
            // Upsert: update existing row for this user+date, or insert
            const { data: result } = await runQuery(
                supabase
                    .from('step_counts')
                    .upsert({ user_id: uid, ...data })
                    .select()
                    .single()
            );
            setSteps((prev) => {
                const existing = prev.find((s) => s.date === dateVal);
                if (existing) return prev.map((s) => (s.date === dateVal ? result : s));
                return [result, ...prev];
            });
        } catch (e) {
            setError(e.message);
        }
    }, []);

    const getStepsByDate = useCallback(async (date) => {
        const uid = await getUserId();
        if (!uid) return null;
        const { data } = await runQuery(
            supabase.from('step_counts').select('*').eq('user_id', uid).eq('date', date).maybeSingle()
        );
        return data;
    }, []);

    return { steps, loading, error, updateSteps, getStepsByDate, refetch: fetchSteps };
}

/* ========================================================================== */
/*  9. useActivitySummary                                                      */
/* ========================================================================== */

/**
 * @returns {{ summary: array, loading: boolean, error: string|null, getSummaryByDate: (date: string) => Promise<object>, getSummaryByDateRange: (start: string, end: string) => Promise<void> }}
 */
export function useActivitySummary() {
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSummary = useCallback(async (startDate, endDate) => {
        const uid = await getUserId();
        if (!uid) { setSummary([]); setLoading(false); return; }
        try {
            setLoading(true);
            setError(null);
            let query = supabase.from('activity_summary').select('*').eq('user_id', uid).order('date', { ascending: false });
            if (startDate) query = query.gte('date', startDate);
            if (endDate) query = query.lte('date', endDate);
            const { data } = await runQuery(query);
            setSummary(data || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSummary(); }, [fetchSummary]);

    const getSummaryByDate = useCallback(async (date) => {
        const uid = await getUserId();
        if (!uid) return null;
        const { data } = await runQuery(
            supabase.from('activity_summary').select('*').eq('user_id', uid).eq('date', date).maybeSingle()
        );
        return data;
    }, []);

    const getSummaryByDateRange = useCallback(
        (start, end) => fetchSummary(start, end),
        [fetchSummary]
    );

    return { summary, loading, error, getSummaryByDate, getSummaryByDateRange, refetch: fetchSummary };
}

/* ========================================================================== */
/*  10. useRecipeRatings                                                       */
/* ========================================================================== */

/**
 * @returns {{ ratings: array, loading: boolean, error: string|null, rateRecipe: (recipeId: number, rating: number, review?: string) => Promise<void>, getUserRating: (recipeId: number) => Promise<object|null> }}
 */
export function useRecipeRatings() {
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRatings = useCallback(async () => {
        const uid = await getUserId();
        if (!uid) { setRatings([]); setLoading(false); return; }
        try {
            setLoading(true);
            setError(null);
            const { data } = await runQuery(
                supabase.from('recipe_ratings').select('*').eq('user_id', uid).order('created_at', { ascending: false })
            );
            setRatings(data || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRatings(); }, [fetchRatings]);

    const rateRecipe = useCallback(async (recipeId, rating, review = '', madeIt = false) => {
        const uid = await getUserId();
        if (!uid) return;
        try {
            setError(null);
            const { data: result } = await runQuery(
                supabase
                    .from('recipe_ratings')
                    .upsert({ user_id: uid, recipe_id: recipeId, rating, review, made_it: madeIt })
                    .select()
                    .single()
            );
            setRatings((prev) => {
                const existing = prev.find((r) => r.recipe_id === recipeId);
                if (existing) return prev.map((r) => (r.recipe_id === recipeId ? result : r));
                return [result, ...prev];
            });
        } catch (e) {
            setError(e.message);
        }
    }, []);

    const getUserRating = useCallback(async (recipeId) => {
        const uid = await getUserId();
        if (!uid) return null;
        const { data } = await runQuery(
            supabase.from('recipe_ratings').select('*').eq('user_id', uid).eq('recipe_id', recipeId).maybeSingle()
        );
        return data;
    }, []);

    return { ratings, loading, error, rateRecipe, getUserRating, refetch: fetchRatings };
}
