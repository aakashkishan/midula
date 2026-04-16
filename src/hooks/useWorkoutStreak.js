import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'midula_streaks';

function getLocalToday() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().split('T')[0];
}

function getYesterday() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    local.setDate(local.getDate() - 1);
    return local.toISOString().split('T')[0];
}

const defaultData = {
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
    totalWorkouts: 0,
    streakHistory: [],
};

function loadData() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            // Ensure all fields exist
            return { ...defaultData, ...data };
        }
    } catch {}
    return { ...defaultData };
}

function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
}

const MILESTONES = [3, 7, 14, 30];

export function useWorkoutStreak() {
    const [streakData, setStreakData] = useState(loadData);
    const previousStreakRef = useRef(streakData.currentStreak);
    const [previousStreak, setPreviousStreak] = useState(streakData.currentStreak);

    // Check if streak is broken (missed a day)
    useEffect(() => {
        const data = loadData();
        if (data.lastWorkoutDate && data.currentStreak > 0) {
            const today = getLocalToday();
            const yesterday = getYesterday();
            if (data.lastWorkoutDate !== today && data.lastWorkoutDate !== yesterday) {
                // Streak broken
                const updated = { ...data, currentStreak: 0 };
                saveData(updated);
                setStreakData(updated);
            }
        }
    }, []);

    const recordWorkout = useCallback(() => {
        setStreakData(prev => {
            const today = getLocalToday();
            const yesterday = getYesterday();

            let newStreak = prev.currentStreak;
            if (prev.lastWorkoutDate === today) {
                // Already worked out today, don't double-count
                return prev;
            } else if (prev.lastWorkoutDate === yesterday || prev.currentStreak === 0) {
                // Continue or start streak
                newStreak = prev.currentStreak + 1;
            } else {
                // Streak broken, start new
                newStreak = 1;
            }

            const newLongest = Math.max(prev.longestStreak, newStreak);
            const history = [...prev.streakHistory, today];

            const updated = {
                currentStreak: newStreak,
                longestStreak: newLongest,
                lastWorkoutDate: today,
                totalWorkouts: prev.totalWorkouts + 1,
                streakHistory: history,
            };

            saveData(updated);
            setPreviousStreak(prev.currentStreak);
            return updated;
        });
    }, []);

    const resetStreak = useCallback(() => {
        saveData({ ...defaultData });
        setStreakData({ ...defaultData });
        setPreviousStreak(0);
    }, []);

    const isStreakAtRisk = streakData.currentStreak > 0 &&
        streakData.lastWorkoutDate !== getLocalToday();

    const nextMilestone = MILESTONES.find(m => m > streakData.currentStreak) || null;

    return {
        streakInfo: streakData,
        previousStreak,
        isStreakAtRisk,
        nextMilestone,
        recordWorkout,
        resetStreak,
    };
}

export default useWorkoutStreak;
