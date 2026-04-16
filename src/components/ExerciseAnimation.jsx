import { useState, useEffect, useRef } from 'react';
import MeditationBreath from './MeditationBreath';
import './ExerciseAnimation.css';

// speed: 'slow' = yoga/pilates (1200ms), 'normal' = core/walk (800ms), 'fast' = HIIT/CrossFit (500ms)
const SPEED_MAP = { slow: 1200, normal: 800, fast: 500 };

export default function ExerciseAnimation({ frame1, frame2, name, muscles, speed = 'normal', isRest = false }) {
    const [showFrame2, setShowFrame2] = useState(false);
    const intervalRef = useRef(null);
    const intervalMs = SPEED_MAP[speed] ?? 800;

    // Reset flipbook when exercise changes
    useEffect(() => {
        setShowFrame2(false);
    }, [frame1]);

    // Flipbook interval
    useEffect(() => {
        if (!frame2) return;
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setShowFrame2(prev => !prev);
        }, intervalMs);
        return () => clearInterval(intervalRef.current);
    }, [frame2, intervalMs]);

    // — REST state: Full meditation animation
    if (isRest) {
        return (
            <div className="exercise-animation-container">
                <div className="exercise-glow rest-glow" />
                <MeditationBreath />
            </div>
        );
    }

    // — EXERCISE state
    return (
        <div className="exercise-animation-container">
            <div className={`exercise-glow speed-${speed}`} />

            <div className="exercise-img-wrap">
                {frame2 ? (
                    <>
                        {/* Frame 1 */}
                        <img
                            src={frame1}
                            alt={`${name} position 1`}
                            className={`exercise-img frame ${showFrame2 ? 'frame-hidden' : 'frame-visible'}`}
                            draggable={false}
                        />
                        {/* Frame 2 */}
                        <img
                            src={frame2}
                            alt={`${name} position 2`}
                            className={`exercise-img frame ${showFrame2 ? 'frame-visible' : 'frame-hidden'}`}
                            draggable={false}
                        />
                        {/* Frame dots */}
                        <div className="frame-dots">
                            <div className={`frame-dot ${!showFrame2 ? 'active' : ''}`} />
                            <div className={`frame-dot ${showFrame2 ? 'active' : ''}`} />
                        </div>
                    </>
                ) : (
                    <img
                        src={frame1}
                        alt={name}
                        className="exercise-img exercise-breathe"
                        draggable={false}
                    />
                )}
            </div>

            {/* Muscle badge */}
            {muscles && (
                <div className="exercise-muscle-badge">
                    <span className="muscle-dot" />
                    {muscles}
                </div>
            )}
        </div>
    );
}
