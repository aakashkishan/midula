import { useState, useEffect } from 'react';
import { getCouponsForMilestone } from '../data/coupons';
import { useCouponRewards } from '../hooks/useCouponRewards';
import './StreakDisplay.css';

const MILESTONES = [3, 7, 14, 30];

const MILESTONE_LABELS = {
    3: '🌱 Getting Started',
    7: '🔥 Week Warrior',
    14: '💪 Two Week Titan',
    30: '👑 Monthly Master',
};

const MOTIVATIONAL_MESSAGES = {
    0: 'Start your streak today! 💪',
    1: 'Day 1! The journey of a thousand miles begins with a single step.',
    2: 'Two days in a row! You\'re building momentum!',
    3: '3 days! You\'re on fire! 🔥',
    7: 'A full week! Incredible dedication! 🌟',
    14: 'Two weeks strong! You\'re unstoppable! 💎',
    30: 'A MONTH! Absolute legend! 👑',
};

function getMotivationalMessage(streak) {
    if (streak >= 30) return MOTIVATIONAL_MESSAGES[30];
    if (streak >= 14) return MOTIVATIONAL_MESSAGES[14];
    if (streak >= 7) return MOTIVATIONAL_MESSAGES[7];
    return MOTIVATIONAL_MESSAGES[streak] || MOTIVATIONAL_MESSAGES[0];
}

function getNextMilestone(streak) {
    return MILESTONES.find(m => m > streak) || null;
}

export default function StreakDisplay({ streakInfo, onReset, onOpenRewards }) {
    const { currentStreak = 0, longestStreak = 0, totalWorkouts = 0, streakHistory = [] } = streakInfo || {};
    const [animateIn, setAnimateIn] = useState(false);
    const { unlocked, claimed } = useCouponRewards(currentStreak);

    useEffect(() => {
        const t = setTimeout(() => setAnimateIn(true), 100);
        return () => clearTimeout(t);
    }, []);

    const message = getMotivationalMessage(currentStreak);
    const nextMilestone = getNextMilestone(currentStreak);
    const prevMilestone = [...MILESTONES].reverse().find(m => m <= currentStreak) || 0;
    const milestoneProgress = nextMilestone
        ? ((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100
        : 100;

    // Last 7 days
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });

    const isUrgent = currentStreak > 0 && !streakHistory.includes(today.toISOString().split('T')[0]);

    return (
        <div className={`streak-display ${animateIn ? 'streak-animate-in' : ''}`}>
            <div className="streak-header">
                <span className="streak-flame" style={{ fontSize: `${1.2 + Math.min(currentStreak * 0.05, 0.8)}rem` }}>
                    🔥
                </span>
                <div className="streak-title-wrap">
                    <h3 className="streak-count">{currentStreak} day streak</h3>
                    {isUrgent && <span className="streak-urgent">Don't break the streak!</span>}
                </div>
            </div>

            <p className="streak-message">{message}</p>

            {/* Weekly Calendar */}
            <div className="streak-weekly">
                {last7Days.map((dateStr, i) => {
                    const completed = streakHistory.includes(dateStr);
                    const isToday = dateStr === today.toISOString().split('T')[0];
                    return (
                        <div key={dateStr} className="streak-day">
                            <span className="streak-day-label">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(dateStr).getDay()]}
                            </span>
                            <div className={`streak-day-dot ${completed ? 'completed' : ''} ${isToday ? 'today' : ''}`} />
                        </div>
                    );
                })}
            </div>

            {/* Milestone Progress */}
            {nextMilestone && (
                <div className="streak-milestone-progress">
                    <div className="streak-milestone-labels">
                        <span className="streak-milestone-current">{prevMilestone}d</span>
                        <span className="streak-milestone-target">Next: {nextMilestone}d</span>
                    </div>
                    <div className="streak-milestone-bar">
                        <div className="streak-milestone-fill" style={{ width: `${milestoneProgress}%` }} />
                    </div>
                </div>
            )}

            {/* Stats Row */}
            <div className="streak-stats-row">
                <div className="streak-stat">
                    <span className="streak-stat-val">{longestStreak}</span>
                    <span className="streak-stat-label">Best Streak</span>
                </div>
                <div className="streak-stat">
                    <span className="streak-stat-val">{totalWorkouts}</span>
                    <span className="streak-stat-label">Total Workouts</span>
                </div>
            </div>

            {/* Milestone Badges */}
            <div className="streak-badges">
                {MILESTONES.map(m => {
                    const unlocked_status = currentStreak >= m;
                    const coupons = getCouponsForMilestone(m);
                    const claimedCount = coupons.filter(c => claimed.includes(c.id)).length;
                    return (
                        <div key={m} className={`streak-badge ${unlocked_status ? 'unlocked' : 'locked'}`}>
                            <span className="badge-days">{m}d</span>
                            <span className="badge-label">{MILESTONE_LABELS[m]}</span>
                            {unlocked_status && (
                                <span className="badge-coupon-count">{claimedCount}/{coupons.length} claimed</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* View Rewards Button */}
            {onOpenRewards && unlocked.length > 0 && (
                <button className="streak-view-rewards-btn" onClick={onOpenRewards}>
                    &#127873; View Rewards ({claimed.length} claimed)
                </button>
            )}

            {/* Debug Reset (hidden, for testing) */}
            {onReset && (
                <button className="streak-reset-btn" onClick={onReset} title="Reset streak (debug)">
                    ↺ Reset
                </button>
            )}
        </div>
    );
}
