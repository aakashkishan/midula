import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'midula_notifications';
const HISTORY_KEY = 'midula_notification_history';
const LAST_FIRED_KEY = 'midula_notification_last_fired';
const MAX_HISTORY = 10;

const DEFAULT_CONFIG = {
    water_reminder: {
        enabled: true,
        time: '08:00',
        frequency: '2h',
        icon: '💧',
        title: 'Water Reminder',
        message: 'Time to hydrate! 💧',
    },
    meal_reminder: {
        enabled: true,
        time: '12:00',
        frequency: 'once',
        icon: '🍽️',
        title: 'Meal Reminder',
        message: "Don't forget to log your meals! 🍽️",
    },
    workout_reminder: {
        enabled: true,
        time: '07:00',
        frequency: 'once',
        icon: '💪',
        title: 'Workout Reminder',
        message: 'Ready for your daily workout? 💪',
    },
    recipe_recommendation: {
        enabled: true,
        time: '10:00',
        frequency: 'once',
        icon: '🌿',
        title: 'Recipe Recommendation',
        message: 'Check out this new recipe! 🌿',
    },
    stretch_reminder: {
        enabled: true,
        time: '14:00',
        frequency: '4h',
        icon: '🧘',
        title: 'Stretch Reminder',
        message: 'Take a stretch break! 🧘',
    },
};

function loadConfig() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            const merged = {};
            for (const key of Object.keys(DEFAULT_CONFIG)) {
                merged[key] = { ...DEFAULT_CONFIG[key], ...(parsed[key] || {}) };
            }
            return merged;
        }
    } catch { /* ignore */ }
    return { ...DEFAULT_CONFIG };
}

function loadHistory() {
    try {
        const stored = localStorage.getItem(HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch { return []; }
}

function loadLastFired() {
    try {
        const stored = localStorage.getItem(LAST_FIRED_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
}

function saveConfig(config) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function saveHistory(history) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function saveLastFired(lastFired) {
    localStorage.setItem(LAST_FIRED_KEY, JSON.stringify(lastFired));
}

function addHistory(type, config) {
    const history = loadHistory();
    history.unshift({
        type,
        title: config.title,
        message: config.message,
        icon: config.icon,
        firedAt: new Date().toISOString(),
    });
    if (history.length > MAX_HISTORY) {
        history.length = MAX_HISTORY;
    }
    saveHistory(history);
}

function canFire(type, config) {
    const lastFired = loadLastFired();
    const lastTime = lastFired[type];

    if (!lastTime) return true;

    const now = Date.now();
    const elapsed = now - lastTime;
    const freqMs = getFrequencyMs(config.frequency);

    return elapsed >= freqMs;
}

function markFired(type) {
    const lastFired = loadLastFired();
    lastFired[type] = Date.now();
    saveLastFired(lastFired);
}

function getFrequencyMs(frequency) {
    switch (frequency) {
        case 'once':
            return 24 * 60 * 60 * 1000; // 24 hours
        case '2h':
            return 2 * 60 * 60 * 1000;
        case '4h':
            return 4 * 60 * 60 * 1000;
        case '6h':
            return 6 * 60 * 60 * 1000;
        default:
            return 24 * 60 * 60 * 1000;
    }
}

function shouldFireAtTime(config) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [targetHour, targetMinute] = config.time.split(':').map(Number);
    const targetMinutes = targetHour * 60 + targetMinute;

    const toleranceMinutes = config.frequency === 'once' ? 1 : getFrequencyMs(config.frequency) / 60000;

    return Math.abs(currentMinutes - targetMinutes) < toleranceMinutes;
}

async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        return 'unsupported';
    }
    if (Notification.permission === 'granted') {
        return 'granted';
    }
    if (Notification.permission === 'denied') {
        return 'denied';
    }
    try {
        const permission = await Notification.requestPermission();
        return permission;
    } catch {
        return 'denied';
    }
}

function sendWebNotification(title, message, icon) {
    if (!('Notification' in window)) return false;
    if (Notification.permission !== 'granted') return false;

    try {
        new Notification(title, {
            body: message,
            icon: icon || '/vite.svg',
            badge: '/vite.svg',
            tag: title,
        });
        return true;
    } catch {
        return false;
    }
}

export default function useNotifications() {
    const [config, setConfig] = useState(loadConfig);
    const [history, setHistory] = useState(loadHistory);
    const [permission, setPermission] = useState(
        typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
    );
    const [toasts, setToasts] = useState([]);
    const intervalRef = useRef(null);
    const lastCheckedMinute = useRef('');

    const addToast = useCallback((title, message, icon) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, title, message, icon }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const updateConfig = useCallback((type, updates) => {
        setConfig(prev => {
            const next = {
                ...prev,
                [type]: { ...prev[type], ...updates },
            };
            saveConfig(next);
            return next;
        });
    }, []);

    const toggleNotification = useCallback((type, enabled) => {
        updateConfig(type, { enabled });
    }, [updateConfig]);

    const setTime = useCallback((type, time) => {
        updateConfig(type, { time });
    }, [updateConfig]);

    const setFrequency = useCallback((type, frequency) => {
        updateConfig(type, { frequency });
    }, [updateConfig]);

    const requestPermission = useCallback(async () => {
        const result = await requestNotificationPermission();
        setPermission(result);
        return result;
    }, []);

    const clearHistory = useCallback(() => {
        saveHistory([]);
        setHistory([]);
    }, []);

    const resetConfig = useCallback(() => {
        saveConfig(DEFAULT_CONFIG);
        setConfig({ ...DEFAULT_CONFIG });
    }, []);

    useEffect(() => {
        if (typeof Notification !== 'undefined') {
            setPermission(Notification.permission);
        }
    }, []);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            const now = new Date();
            const minuteKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;

            if (minuteKey === lastCheckedMinute.current) return;
            lastCheckedMinute.current = minuteKey;

            const currentConfig = loadConfig();

            for (const [type, notificationConfig] of Object.entries(currentConfig)) {
                if (!notificationConfig.enabled) continue;

                if (!shouldFireAtTime(notificationConfig)) continue;
                if (!canFire(type, notificationConfig)) continue;

                markFired(type);
                addHistory(type, notificationConfig);
                setHistory(loadHistory());

                const webSent = sendWebNotification(
                    notificationConfig.title,
                    notificationConfig.message,
                    notificationConfig.icon
                );

                if (!webSent) {
                    addToast(notificationConfig.title, notificationConfig.message, notificationConfig.icon);
                } else {
                    addToast(notificationConfig.title, notificationConfig.message, notificationConfig.icon);
                }
            }
        }, 60000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [addToast]);

    return {
        config,
        history,
        permission,
        toasts,
        toggleNotification,
        setTime,
        setFrequency,
        requestPermission,
        dismissToast,
        clearHistory,
        resetConfig,
    };
}

export { DEFAULT_CONFIG };
