/**
 * useAnalytics.js - Analytics hooks that compute insights from user data.
 *
 * All hooks:
 * - Use the Supabase client from src/lib/supabase
 * - Handle unauthenticated state gracefully
 * - Cache results with useState
 * - Expose loading / error states
 * - Include retry logic with exponential backoff
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/* ========================================================================== */
/*  Shared helpers                                                            */
/* ========================================================================== */

async function getUserId() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
}

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

async function runQuery(query) {
    return withRetry(async () => {
        const { data, error } = await query;
        if (error) throw error;
        return data;
    });
}

/** Get ISO date string for N days ago */
function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
}

/** Average of an array, ignoring non-numbers */
function avg(arr) {
    const nums = arr.filter((v) => typeof v === 'number' && !isNaN(v));
    return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

/** Pearson correlation coefficient for two equal-length arrays */
function pearson(x, y) {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;
    let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
    for (let i = 0; i < n; i++) {
        sx += x[i]; sy += y[i];
        sxx += x[i] * x[i]; syy += y[i] * y[i];
        sxy += x[i] * y[i];
    }
    const denom = Math.sqrt((sxx - sx * sx / n) * (syy - sy * sy / n));
    return denom === 0 ? 0 : (sxy - sx * sy / n) / denom;
}

/* ========================================================================== */
/*  1. useWeeklyTrends                                                         */
/* ========================================================================== */

/**
 * Returns weekly averages for key metrics and compares to the previous week.
 * @returns {{ trends: object, loading: boolean, error: string|null }}
 */
export function useWeeklyTrends() {
    const [trends, setTrends] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTrends = useCallback(async () => {
        const uid = await getUserId();
        if (!uid) { setTrends(null); setLoading(false); return; }
        try {
            setLoading(true);
            setError(null);

            const thisWeekStart = daysAgo(6);
            const thisWeekEnd = daysAgo(0);
            const prevWeekStart = daysAgo(13);
            const prevWeekEnd = daysAgo(7);

            // Fetch activity summaries for both weeks
            const summaries = await runQuery(
                supabase.from('activity_summary')
                    .select('*')
                    .eq('user_id', uid)
                    .gte('date', prevWeekStart)
                    .lte('date', thisWeekEnd)
                    .order('date', { ascending: true })
            );

            // Fetch meal logs for calories/protein
            const meals = await runQuery(
                supabase.from('meal_logs')
                    .select('date, calories, protein_g, carbs_g, fats_g')
                    .eq('user_id', uid)
                    .gte('date', prevWeekStart)
                    .lte('date', thisWeekEnd)
            );

            // Fetch workout sessions
            const workouts = await runQuery(
                supabase.from('workout_sessions')
                    .select('date, duration_seconds')
                    .eq('user_id', uid)
                    .gte('date', prevWeekStart)
                    .lte('date', thisWeekEnd)
            );

            // Fetch sleep logs
            const sleeps = await runQuery(
                supabase.from('sleep_logs')
                    .select('date, hours_slept')
                    .eq('user_id', uid)
                    .gte('date', prevWeekStart)
                    .lte('date', thisWeekEnd)
            );

            // Fetch water logs
            const waters = await runQuery(
                supabase.from('water_logs')
                    .select('date, amount_ml')
                    .eq('user_id', uid)
                    .gte('date', prevWeekStart)
                    .lte('date', thisWeekEnd)
            );

            // Fetch mood logs
            const moods = await runQuery(
                supabase.from('mood_logs')
                    .select('date, mood_score')
                    .eq('user_id', uid)
                    .gte('date', prevWeekStart)
                    .lte('date', thisWeekEnd)
            );

            // Fetch step counts
            const stepData = await runQuery(
                supabase.from('step_counts')
                    .select('date, steps')
                    .eq('user_id', uid)
                    .gte('date', prevWeekStart)
                    .lte('date', thisWeekEnd)
            );

            const isInThisWeek = (date) => date >= thisWeekStart && date <= thisWeekEnd;
            const isInPrevWeek = (date) => date >= prevWeekStart && date <= prevWeekEnd;

            const computeWeekAvg = (items, key, predicate) => {
                const filtered = (items || []).filter((r) => predicate(r.date));
                const values = filtered.map((r) => r[key]).filter((v) => typeof v === 'number');
                return values.length ? values.reduce((a, b) => a + b, 0) / 7 : 0; // per-day average over 7 days
            };

            const thisWeek = {
                avgCalories: computeWeekAvg(meals, 'calories', isInThisWeek) +
                    (summaries || []).filter((s) => isInThisWeek(s.date)).reduce((s, r) => s + (r.total_calories_consumed || 0), 0) / 7,
                avgProtein: computeWeekAvg(meals, 'protein_g', isInThisWeek),
                avgWorkoutMinutes: (workouts || []).filter((w) => isInThisWeek(w.date)).reduce((s, w) => s + ((w.duration_seconds || 0) / 60), 0) / 7,
                avgSteps: computeWeekAvg(stepData, 'steps', isInThisWeek),
                avgWater: (waters || []).filter((w) => isInThisWeek(w.date)).reduce((s, w) => s + (w.amount_ml || 0), 0) / 7,
                avgSleep: computeWeekAvg(sleeps, 'hours_slept', isInThisWeek),
                avgMood: computeWeekAvg(moods, 'mood_score', isInThisWeek),
            };

            const prevWeek = {
                avgCalories: computeWeekAvg(meals, 'calories', isInPrevWeek) +
                    (summaries || []).filter((s) => isInPrevWeek(s.date)).reduce((s, r) => s + (r.total_calories_consumed || 0), 0) / 7,
                avgProtein: computeWeekAvg(meals, 'protein_g', isInPrevWeek),
                avgWorkoutMinutes: (workouts || []).filter((w) => isInPrevWeek(w.date)).reduce((s, w) => s + ((w.duration_seconds || 0) / 60), 0) / 7,
                avgSteps: computeWeekAvg(stepData, 'steps', isInPrevWeek),
                avgWater: (waters || []).filter((w) => isInPrevWeek(w.date)).reduce((s, w) => s + (w.amount_ml || 0), 0) / 7,
                avgSleep: computeWeekAvg(sleeps, 'hours_slept', isInPrevWeek),
                avgMood: computeWeekAvg(moods, 'mood_score', isInPrevWeek),
            };

            const compare = (curr, prev) => {
                if (prev === 0) return curr > 0 ? 100 : 0;
                return Math.round(((curr - prev) / prev) * 100);
            };

            setTrends({
                thisWeek,
                prevWeek,
                change: {
                    caloriesChange: compare(thisWeek.avgCalories, prevWeek.avgCalories),
                    proteinChange: compare(thisWeek.avgProtein, prevWeek.avgProtein),
                    workoutMinutesChange: compare(thisWeek.avgWorkoutMinutes, prevWeek.avgWorkoutMinutes),
                    stepsChange: compare(thisWeek.avgSteps, prevWeek.avgSteps),
                    waterChange: compare(thisWeek.avgWater, prevWeek.avgWater),
                    sleepChange: compare(thisWeek.avgSleep, prevWeek.avgSleep),
                    moodChange: compare(thisWeek.avgMood, prevWeek.avgMood),
                },
            });
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTrends(); }, [fetchTrends]);

    return { trends, loading, error, refetch: fetchTrends };
}

/* ========================================================================== */
/*  2. useCalorieTracking                                                      */
/* ========================================================================== */

/**
 * Daily calorie deficit/surplus, weekly average deficit, projected weight change.
 * @returns {{ dailyDeficit: number|null, weeklyAvgDeficit: number, projectedWeeklyKg: number, loading: boolean, error: string|null }}
 */
export function useCalorieTracking() {
    const [dailyDeficit, setDailyDeficit] = useState(null);
    const [weeklyAvgDeficit, setWeeklyAvgDeficit] = useState(0);
    const [projectedWeeklyKg, setProjectedWeeklyKg] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCalorieData = useCallback(async () => {
        const uid = await getUserId();
        if (!uid) { setLoading(false); return; }
        try {
            setLoading(true);
            setError(null);

            const today = daysAgo(0);
            const weekStart = daysAgo(6);

            // Today's activity summary
            const todaySummary = await runQuery(
                supabase.from('activity_summary')
                    .select('total_calories_consumed, total_calories_burned')
                    .eq('user_id', uid)
                    .eq('date', today)
                    .maybeSingle()
            );

            // Past week summaries
            const weekSummaries = await runQuery(
                supabase.from('activity_summary')
                    .select('total_calories_consumed, total_calories_burned')
                    .eq('user_id', uid)
                    .gte('date', weekStart)
                    .lte('date', today)
            );

            // Also factor in meal logs for consumed calories
            const todayMeals = await runQuery(
                supabase.from('meal_logs')
                    .select('calories')
                    .eq('user_id', uid)
                    .eq('date', today)
            );

            const weekMeals = await runQuery(
                supabase.from('meal_logs')
                    .select('calories')
                    .eq('user_id', uid)
                    .gte('date', weekStart)
                    .lte('date', today)
            );

            // Calculate today
            const consumedFromSummary = todaySummary?.total_calories_consumed || 0;
            const consumedFromMeals = (todayMeals || []).reduce((s, m) => s + (m.calories || 0), 0);
            const totalConsumed = Math.max(consumedFromSummary, consumedFromMeals) || consumedFromMeals + consumedFromSummary;
            const burned = (todaySummary?.total_calories_burned || 0) + 1800; // +1800 base BMR estimate

            const deficit = burned - totalConsumed; // positive = deficit
            setDailyDeficit(deficit !== 0 ? deficit : null);

            // Weekly average
            const weekConsumedFromSummary = (weekSummaries || []).reduce((s, r) => s + (r.total_calories_consumed || 0), 0);
            const weekConsumedFromMeals = (weekMeals || []).reduce((s, m) => s + (m.calories || 0), 0);
            const weekTotalConsumed = Math.max(weekConsumedFromSummary, weekConsumedFromMeals) || weekConsumedFromMeals + weekConsumedFromSummary;
            const weekBurned = (weekSummaries || []).reduce((s, r) => s + (r.total_calories_burned || 0), 0) + 1800 * 7;

            const avgDeficit = (weekBurned - weekTotalConsumed) / 7;
            setWeeklyAvgDeficit(Math.round(avgDeficit));

            // ~7700 kcal = 1 kg of body weight
            const weeklyKgChange = Math.round((avgDeficit * 7 / 7700) * 100) / 100;
            setProjectedWeeklyKg(weeklyKgChange);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCalorieData(); }, [fetchCalorieData]);

    return { dailyDeficit, weeklyAvgDeficit, projectedWeeklyKg, loading, error, refetch: fetchCalorieData };
}

/* ========================================================================== */
/*  3. useCorrelations                                                         */
/* ========================================================================== */

/**
 * Computes correlations between activity types.
 * @returns {{ correlations: object, loading: boolean, error: string|null }}
 */
export function useCorrelations() {
    const [correlations, setCorrelations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCorrelations = useCallback(async () => {
        const uid = await getUserId();
        if (!uid) { setCorrelations(null); setLoading(false); return; }
        try {
            setLoading(true);
            setError(null);

            const startDate = daysAgo(59); // last 60 days
            const endDate = daysAgo(0);

            const [workouts, moods, sleeps, meals, steps] = await Promise.all([
                runQuery(supabase.from('workout_sessions').select('date, duration_seconds').eq('user_id', uid).gte('date', startDate).lte('date', endDate).order('date')),
                runQuery(supabase.from('mood_logs').select('date, mood_score, energy_level').eq('user_id', uid).gte('date', startDate).lte('date', endDate).order('date')),
                runQuery(supabase.from('sleep_logs').select('date, hours_slept, sleep_quality').eq('user_id', uid).gte('date', startDate).lte('date', endDate).order('date')),
                runQuery(supabase.from('meal_logs').select('date, protein_g, calories').eq('user_id', uid).gte('date', startDate).lte('date', endDate).order('date')),
                runQuery(supabase.from('step_counts').select('date, steps').eq('user_id', uid).gte('date', startDate).lte('date', endDate).order('date')),
            ]);

            // Build date-keyed maps
            const byDate = {};
            const initDay = () => ({ workoutMin: 0, mood: null, energy: null, sleepHrs: null, protein: 0, steps: 0 });

            (workouts || []).forEach((w) => {
                if (!byDate[w.date]) byDate[w.date] = initDay();
                byDate[w.date].workoutMin += (w.duration_seconds || 0) / 60;
            });
            (moods || []).forEach((m) => {
                if (!byDate[m.date]) byDate[m.date] = initDay();
                byDate[m.date].mood = m.mood_score;
                byDate[m.date].energy = m.energy_level;
            });
            (sleeps || []).forEach((s) => {
                if (!byDate[s.date]) byDate[s.date] = initDay();
                byDate[s.date].sleepHrs = s.hours_slept;
            });
            (meals || []).forEach((m) => {
                if (!byDate[m.date]) byDate[m.date] = initDay();
                byDate[m.date].protein += m.protein_g || 0;
            });
            (steps || []).forEach((s) => {
                if (!byDate[s.date]) byDate[s.date] = initDay();
                byDate[s.date].steps = s.steps || 0;
            });

            const dates = Object.keys(byDate).sort();
            if (dates.length < 3) {
                setCorrelations({ workoutMood: 0, sleepPerformance: 0, nutritionEnergy: 0, sampleSize: dates.length });
                setLoading(false);
                return;
            }

            const workoutMoodCorr = pearson(
                dates.map((d) => byDate[d].workoutMin),
                dates.map((d) => byDate[d].mood ?? 0)
            );

            const sleepPerfCorr = pearson(
                dates.map((d) => byDate[d].sleepHrs ?? 0),
                dates.map((d) => byDate[d].workoutMin)
            );

            const nutritionEnergyCorr = pearson(
                dates.map((d) => byDate[d].protein),
                dates.map((d) => byDate[d].energy ?? 0)
            );

            setCorrelations({
                workoutMood: Math.round(workoutMoodCorr * 100) / 100,
                sleepPerformance: Math.round(sleepPerfCorr * 100) / 100,
                nutritionEnergy: Math.round(nutritionEnergyCorr * 100) / 100,
                sampleSize: dates.length,
            });
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCorrelations(); }, [fetchCorrelations]);

    return { correlations, loading, error, refetch: fetchCorrelations };
}

/* ========================================================================== */
/*  4. usePersonalRecords                                                      */
/* ========================================================================== */

/**
 * @returns {{ records: object, loading: boolean, error: string|null }}
 */
export function usePersonalRecords() {
    const [records, setRecords] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRecords = useCallback(async () => {
        const uid = await getUserId();
        if (!uid) { setRecords(null); setLoading(false); return; }
        try {
            setLoading(true);
            setError(null);

            const [workouts, steps, waters, moods] = await Promise.all([
                runQuery(supabase.from('workout_sessions').select('*').eq('user_id', uid).order('date')),
                runQuery(supabase.from('step_counts').select('steps, date').eq('user_id', uid).order('steps', { ascending: false }).limit(1)),
                runQuery(supabase.from('water_logs').select('amount_ml, date').eq('user_id', uid).order('amount_ml', { ascending: false }).limit(1)),
                runQuery(supabase.from('mood_logs').select('mood_score, date').eq('user_id', uid).order('mood_score', { ascending: false }).limit(1)),
            ]);

            // Longest streak: count consecutive days with at least one workout
            const workoutDates = [...new Set((workouts || []).map((w) => w.date))].sort();
            let longestStreak = 0, currentStreak = 0;
            for (let i = 0; i < workoutDates.length; i++) {
                if (i === 0) { currentStreak = 1; }
                else {
                    const prev = new Date(workoutDates[i - 1]);
                    const curr = new Date(workoutDates[i]);
                    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
                    if (diff === 1) { currentStreak++; }
                    else if (diff > 1) { currentStreak = 1; }
                }
                longestStreak = Math.max(longestStreak, currentStreak);
            }

            // Longest single workout
            const longestWorkout = (workouts || []).reduce(
                (max, w) => Math.max(max, (w.duration_seconds || 0) / 60), 0
            );

            setRecords({
                longestWorkoutStreak: longestStreak,
                mostStepsInDay: steps?.[0]?.steps || 0,
                mostStepsDate: steps?.[0]?.date || null,
                mostWaterInDay: waters?.[0]?.amount_ml || 0,
                mostWaterDate: waters?.[0]?.date || null,
                bestMoodScore: moods?.[0]?.mood_score || 0,
                bestMoodDate: moods?.[0]?.date || null,
                longestSingleWorkoutMin: Math.round(longestWorkout),
                totalWorkouts: (workouts || []).length,
            });
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    return { records, loading, error, refetch: fetchRecords };
}

/* ========================================================================== */
/*  5. useConsistencyScore                                                     */
/* ========================================================================== */

/**
 * @returns {{ consistency: object, loading: boolean, error: string|null }}
 */
export function useConsistencyScore() {
    const [consistency, setConsistency] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchConsistency = useCallback(async () => {
        const uid = await getUserId();
        if (!uid) { setConsistency(null); setLoading(false); return; }
        try {
            setLoading(true);
            setError(null);

            const today = daysAgo(0);

            // Last 30 days
            const monthStart = daysAgo(29);
            const [summaries, workouts, waters, meals] = await Promise.all([
                runQuery(supabase.from('activity_summary').select('date').eq('user_id', uid).gte('date', monthStart).lte('date', today)),
                runQuery(supabase.from('workout_sessions').select('date').eq('user_id', uid).gte('date', monthStart).lte('date', today)),
                runQuery(supabase.from('water_logs').select('date').eq('user_id', uid).gte('date', monthStart).lte('date', today)),
                runQuery(supabase.from('meal_logs').select('date').eq('user_id', uid).gte('date', monthStart).lte('date', today)),
            ]);

            const activeDates = new Set([
                ...(summaries || []).map((s) => s.date),
                ...(workouts || []).map((w) => w.date),
                ...(waters || []).map((w) => w.date),
                ...(meals || []).map((m) => m.date),
            ]);

            // Count active days in last 30
            let monthActive = 0;
            for (let i = 0; i < 30; i++) {
                const d = daysAgo(i);
                if (activeDates.has(d)) monthActive++;
            }

            // Last 7 days
            let weekActive = 0;
            for (let i = 0; i < 7; i++) {
                const d = daysAgo(i);
                if (activeDates.has(d)) weekActive++;
            }

            // Day-of-week consistency: which days are most active?
            const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
            activeDates.forEach((d) => {
                const day = new Date(d).getDay();
                dayCounts[day]++;
            });
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const bestDayIndex = dayCounts.indexOf(Math.max(...dayCounts));

            setConsistency({
                weeklyPct: Math.round((weekActive / 7) * 100),
                monthlyPct: Math.round((monthActive / 30) * 100),
                activeDaysLast30: monthActive,
                mostConsistentDay: dayNames[bestDayIndex],
            });
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchConsistency(); }, [fetchConsistency]);

    return { consistency, loading, error, refetch: fetchConsistency };
}

/* ========================================================================== */
/*  6. useRecommendations                                                      */
/* ========================================================================== */

/**
 * Generates personalized suggestions based on activity patterns.
 * @returns {{ recommendations: string[], loading: boolean, error: string|null }}
 */
export function useRecommendations() {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRecommendations = useCallback(async () => {
        const uid = await getUserId();
        if (!uid) { setRecommendations([]); setLoading(false); return; }
        try {
            setLoading(true);
            setError(null);

            const startDate = daysAgo(29);
            const endDate = daysAgo(0);

            const [workouts, sleeps, moods, meals, waterLogs] = await Promise.all([
                runQuery(supabase.from('workout_sessions').select('date, duration_seconds, routine_name').eq('user_id', uid).gte('date', startDate).lte('date', endDate)),
                runQuery(supabase.from('sleep_logs').select('date, hours_slept, sleep_quality').eq('user_id', uid).gte('date', startDate).lte('date', endDate)),
                runQuery(supabase.from('mood_logs').select('date, mood_score').eq('user_id', uid).gte('date', startDate).lte('date', endDate)),
                runQuery(supabase.from('meal_logs').select('date, protein_g').eq('user_id', uid).gte('date', startDate).lte('date', endDate)),
                runQuery(supabase.from('water_logs').select('date, amount_ml').eq('user_id', uid).gte('date', startDate).lte('date', endDate)),
            ]);

            const recs = [];

            // 1. Sleep-workout correlation
            if (workouts?.length >= 3 && sleeps?.length >= 3) {
                const workoutDates = new Set(workouts.map((w) => w.date));
                const sleepOnWorkoutDays = sleeps.filter((s) => workoutDates.has(s.date)).map((s) => s.sleep_quality || s.hours_slept);
                const sleepOnRestDays = sleeps.filter((s) => !workoutDates.has(s.date)).map((s) => s.sleep_quality || s.hours_slept);

                if (sleepOnWorkoutDays.length > 0 && sleepOnRestDays.length > 0) {
                    const avgWorkoutSleep = avg(sleepOnWorkoutDays);
                    const avgRestSleep = avg(sleepOnRestDays);
                    if (avgWorkoutSleep > avgRestSleep) {
                        recs.push('You sleep better on days you workout -- consider exercising daily for better rest.');
                    }
                }
            }

            // 2. Protein on workout days
            if (workouts?.length >= 2 && meals?.length >= 2) {
                const workoutDates = new Set(workouts.map((w) => w.date));
                const proteinOnWorkoutDays = meals.filter((m) => workoutDates.has(m.date)).map((m) => m.protein_g || 0);
                const proteinOnRestDays = meals.filter((m) => !workoutDates.has(m.date)).map((m) => m.protein_g || 0);

                const avgProteinWorkout = avg(proteinOnWorkoutDays);
                const avgProteinRest = avg(proteinOnRestDays);
                if (avgProteinRest >= avgProteinWorkout && avgProteinWorkout > 0) {
                    recs.push('Try increasing protein on workout days to support muscle recovery.');
                }
            }

            // 3. Most consistent day
            if (workouts?.length >= 3) {
                const dayCounts = [0, 0, 0, 0, 0, 0, 0];
                workouts.forEach((w) => { dayCounts[new Date(w.date).getDay()]++; });
                const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const bestDay = dayCounts.indexOf(Math.max(...dayCounts));
                if (dayCounts[bestDay] > 1) {
                    recs.push(`You're most consistent on ${dayNames[bestDay]}s -- try scheduling workouts on similar days.`);
                }
            }

            // 4. Mood improvement after yoga
            if (workouts?.length >= 2 && moods?.length >= 2) {
                const yogaWorkouts = workouts.filter((w) =>
                    (w.routine_name || '').toLowerCase().includes('yoga')
                );
                if (yogaWorkouts.length >= 1) {
                    const yogaDates = new Set(yogaWorkouts.map((w) => w.date));
                    const moodsAfterYoga = moods.filter((m) => {
                        const moodDate = new Date(m.date);
                        for (const yd of yogaDates) {
                            const yogaDate = new Date(yd);
                            const diff = (moodDate - yogaDate) / (1000 * 60 * 60 * 24);
                            if (diff >= 0 && diff <= 1) return true;
                        }
                        return false;
                    }).map((m) => m.mood_score);

                    const moodsOther = moods.filter((m) => !yogaDates.has(m.date)).map((m) => m.mood_score);
                    if (moodsAfterYoga.length > 0 && moodsOther.length > 0 && avg(moodsAfterYoga) > avg(moodsOther)) {
                        recs.push('Your mood improves after yoga -- consider adding a yoga session this week.');
                    }
                }
            }

            // 5. Water intake suggestion
            if (waterLogs?.length >= 5) {
                const todayWater = waterLogs.filter((w) => w.date === daysAgo(0)).reduce((s, w) => s + w.amount_ml, 0);
                if (todayWater < 2000 && todayWater > 0) {
                    recs.push('You\'re behind on water today -- aim for at least 2L.');
                }
            }

            // 6. No workouts this week
            const thisWeekStart = daysAgo(6);
            const workoutsThisWeek = (workouts || []).filter((w) => w.date >= thisWeekStart);
            if (workoutsThisWeek.length === 0 && workouts?.length > 0) {
                recs.push('No workouts this week yet -- it\'s a great time to start!');
            }

            // Fallback
            if (recs.length === 0) {
                recs.push('Keep logging your activities to get personalized recommendations.');
            }

            setRecommendations(recs);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRecommendations(); }, [fetchRecommendations]);

    return { recommendations, loading, error, refetch: fetchRecommendations };
}
