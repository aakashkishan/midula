import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, Pause, SkipForward, Square, ChevronUp, ChevronDown, Zap } from 'lucide-react';
import { routineExercises } from '../data/exercises';
import ExerciseAnimation from '../components/ExerciseAnimation';
import MeditationBreath from '../components/MeditationBreath';
import useWorkoutStreak from '../hooks/useWorkoutStreak';
import confetti from 'canvas-confetti';
import './WorkoutDetail.css';

// Category badge colors
const CATEGORY_COLORS = {
    CROSSFIT: { bg: 'rgba(254,128,25,0.15)', color: '#fe8019' },
    HIIT:     { bg: 'rgba(251,73,52,0.15)',  color: '#fb4934' },
    YOGA:     { bg: 'rgba(211,134,155,0.15)',color: '#d3869b' },
    PILATES:  { bg: 'rgba(131,165,152,0.15)',color: '#83a598' },
    CORE:     { bg: 'rgba(142,192,124,0.15)',color: '#8ec07c' },
    WALK:     { bg: 'rgba(184,187,38,0.15)', color: '#b8bb26' },
};

export default function WorkoutDetail({ routineId, onBack }) {
    const routine = routineExercises[routineId];
    const exercises = routine.exercises;
    const routineSpeed = routine.speed ?? 'normal';
    const categoryStyle = CATEGORY_COLORS[routine.category] ?? CATEGORY_COLORS.CORE;

    const { recordWorkout } = useWorkoutStreak();
    const [currentIdx, setCurrentIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(exercises[0].duration);
    const [isRunning, setIsRunning] = useState(false);
    const [isRest, setIsRest] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [showExerciseList, setShowExerciseList] = useState(false);
    const intervalRef = useRef(null);

    const current = exercises[currentIdx];
    const totalDuration = current ? (isRest ? current.rest : current.duration) : 0;
    const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

    const circumference = 2 * Math.PI * 54;
    const dashOffset = circumference - (progress / 100) * circumference;

    const handleComplete = useCallback(() => {
        setIsRunning(false);
        setCompleted(true);
        recordWorkout();
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.4 }, colors: ['#8ec07c', '#fabd2f', '#d3869b', '#fe8019', '#83a598'] });
    }, [recordWorkout]);

    const moveToNext = useCallback(() => {
        if (isRest) {
            if (currentIdx + 1 < exercises.length) {
                const nextIdx = currentIdx + 1;
                setCurrentIdx(nextIdx);
                setTimeLeft(exercises[nextIdx].duration);
                setIsRest(false);
            } else {
                handleComplete();
            }
        } else {
            if (current.rest > 0) {
                setIsRest(true);
                setTimeLeft(current.rest);
            } else if (currentIdx + 1 < exercises.length) {
                const nextIdx = currentIdx + 1;
                setCurrentIdx(nextIdx);
                setTimeLeft(exercises[nextIdx].duration);
            } else {
                handleComplete();
            }
        }
    }, [currentIdx, isRest, exercises, current, handleComplete]);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(t => {
                    if (t <= 1) {
                        clearInterval(intervalRef.current);
                        if (!isRest) {
                            confetti({ particleCount: 25, spread: 45, origin: { y: 0.5 }, colors: ['#8ec07c'] });
                        }
                        setTimeout(() => moveToNext(), 300);
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        }
        return () => clearInterval(intervalRef.current);
    }, [isRunning, timeLeft, moveToNext, isRest]);

    const togglePlay = () => setIsRunning(r => !r);

    const skipExercise = () => {
        clearInterval(intervalRef.current);
        moveToNext();
    };

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (completed) {
        return (
            <div className="workout-detail-container fade-up">
                <div className="completion-screen">
                    <div className="completion-emoji">🎉</div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Workout Complete!</h1>
                    <p style={{ color: 'var(--fg4)', marginBottom: '2rem' }}>
                        You crushed <span style={{ color: categoryStyle.color, fontWeight: 700 }}>{routine.name}</span>!
                    </p>
                    <div className="completion-stats">
                        <div className="completion-stat">
                            <span className="completion-stat-val" style={{ color: categoryStyle.color }}>{exercises.length}</span>
                            <span className="completion-stat-label">Exercises</span>
                        </div>
                        <div className="completion-stat">
                            <span className="completion-stat-val text-orange">{exercises.reduce((a, e) => a + e.duration, 0)}s</span>
                            <span className="completion-stat-label">Active Time</span>
                        </div>
                        <div className="completion-stat">
                            <span className="completion-stat-val text-yellow">{routine.rounds}</span>
                            <span className="completion-stat-label">Rounds</span>
                        </div>
                    </div>
                    <button className="btn-primary" onClick={onBack} style={{ marginTop: '2rem', background: categoryStyle.color }}>
                        Back to Workouts
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="workout-detail-container">

            {/* Header */}
            <div className="wd-header fade-up fade-up-1">
                <button onClick={onBack} className="wd-back-btn">
                    <ArrowLeft size={22} />
                </button>
                <div className="wd-header-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="wd-category-badge" style={{ background: categoryStyle.bg, color: categoryStyle.color }}>
                            {routine.category}
                        </span>
                    </div>
                    <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px' }}>{routine.name}</h2>
                </div>
                <div className="wd-progress-dots">
                    {exercises.map((_, i) => (
                        <div key={i} className={`wd-dot ${i < currentIdx ? 'done' : ''} ${i === currentIdx ? 'active' : ''}`} />
                    ))}
                </div>
            </div>

            {/* Exercise Name + Phase */}
            <div className="wd-exercise-name fade-up fade-up-2">
                {isRest ? (
                    <>
                        <span className="wd-phase-badge rest">REST</span>
                        <h1 style={{ fontSize: '1.3rem', marginTop: '0.5rem' }}>Take a Breath</h1>
                        <p style={{ fontSize: '0.8rem', color: 'var(--fg4)', marginTop: '4px' }}>
                            Next: <span style={{ color: 'var(--fg)', fontWeight: 600 }}>
                                {currentIdx + 1 < exercises.length ? exercises[currentIdx + 1].name : 'Done!'}
                            </span>
                        </p>
                    </>
                ) : (
                    <>
                        <span className="wd-phase-badge active">ACTIVE</span>
                        <h1 style={{ fontSize: '1.3rem', marginTop: '0.5rem' }}>{current.name}</h1>
                    </>
                )}
            </div>

            {/* Animation Area */}
            <div className="wd-animation-area fade-up fade-up-3">
                {isRest ? (
                    <div className="wd-meditation-wrap">
                        <MeditationBreath />
                    </div>
                ) : (
                    <ExerciseAnimation
                        frame1={current.frame1}
                        frame2={current.frame2}
                        name={current.name}
                        muscles={current.muscles}
                        speed={routineSpeed}
                        isRest={false}
                    />
                )}
            </div>

            {/* Coaching Tip Card */}
            {!isRest && (
                <div className="wd-coaching-card fade-up fade-up-3" style={{ borderColor: categoryStyle.color + '55' }}>
                    <Zap size={13} color={categoryStyle.color} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span>{current.tip}</span>
                </div>
            )}

            {/* Timer Ring */}
            <div className="wd-timer-area fade-up fade-up-4">
                <div className="wd-timer-ring">
                    <svg width="140" height="140" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="var(--bg2)" strokeWidth="6" />
                        <circle
                            cx="60" cy="60" r="54"
                            fill="none"
                            stroke={isRest ? 'var(--yellow)' : categoryStyle.color}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.3s ease' }}
                            filter={`drop-shadow(0 0 8px ${isRest ? 'rgba(250,189,47,0.5)' : categoryStyle.color + '80'})`}
                        />
                    </svg>
                    <div className="wd-timer-value">
                        <span style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{formatTime(timeLeft)}</span>
                        <span style={{ fontSize: '0.6rem', color: 'var(--fg4)', fontWeight: 600, letterSpacing: '0.08em' }}>
                            {isRest ? 'REST' : 'GO'}
                        </span>
                    </div>
                </div>

                {/* Scrub bar */}
                <div className="wd-scrub-bar">
                    <div
                        className="wd-scrub-fill"
                        style={{
                            width: `${progress}%`,
                            background: isRest ? 'var(--yellow)' : categoryStyle.color,
                            boxShadow: `0 0 8px ${isRest ? 'rgba(250,189,47,0.5)' : categoryStyle.color + '80'}`
                        }}
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="wd-controls fade-up fade-up-5">
                <button className="wd-control-btn secondary" onClick={onBack} title="Stop workout">
                    <Square size={18} />
                </button>
                <button
                    className={`wd-control-btn primary ${isRunning ? 'running' : ''}`}
                    onClick={togglePlay}
                    style={isRunning ? {} : { background: categoryStyle.color, boxShadow: `0 4px 20px ${categoryStyle.color}60` }}
                >
                    {isRunning ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: '3px' }} />}
                </button>
                <button className="wd-control-btn secondary" onClick={skipExercise} title="Skip exercise">
                    <SkipForward size={18} />
                </button>
            </div>

            {/* Exercise List Toggle */}
            <div className="wd-exercise-list-toggle fade-up fade-up-6" onClick={() => setShowExerciseList(!showExerciseList)}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--fg4)' }}>
                    All Exercises ({exercises.length})
                </span>
                {showExerciseList ? <ChevronDown size={16} color="var(--fg4)" /> : <ChevronUp size={16} color="var(--fg4)" />}
            </div>

            {showExerciseList && (
                <div className="wd-exercise-list fade-up">
                    {exercises.map((ex, i) => (
                        <div key={i} className={`wd-exercise-list-item ${i === currentIdx ? 'current' : ''} ${i < currentIdx ? 'done-item' : ''}`}
                             style={i === currentIdx ? { borderColor: categoryStyle.color + '80' } : {}}>
                            <div className="wd-list-num"
                                 style={i === currentIdx ? { background: categoryStyle.color, color: 'var(--bg0-hard)' } : {}}>
                                {i + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{ex.name}</div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--fg4)' }}>{ex.muscles}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--fg4)', marginTop: '1px' }}>{ex.duration}s work · {ex.rest}s rest</div>
                            </div>
                            {i < currentIdx && <span style={{ color: 'var(--green)', fontSize: '1rem' }}>✓</span>}
                            {i === currentIdx && (
                                <span className="wd-current-badge" style={{ color: categoryStyle.color, background: categoryStyle.bg }}>NOW</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
