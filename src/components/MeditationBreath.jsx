import { useEffect, useState, useRef } from 'react';
import './MeditationBreath.css';

/**
 * Box-Breathing guide: 4s inhale → 4s hold → 4s exhale → 4s hold
 * Fully CSS-driven, no external dependencies.
 */
const PHASES = [
    { label: 'Breathe In',  duration: 4, orbScale: 1.0, color: '#8ec07c', ringColor: 'rgba(142,192,124,0.8)' },
    { label: 'Hold',        duration: 4, orbScale: 1.0, color: '#83a598', ringColor: 'rgba(131,165,152,0.8)' },
    { label: 'Breathe Out', duration: 4, orbScale: 0.6, color: '#d3869b', ringColor: 'rgba(211,134,155,0.8)' },
    { label: 'Hold',        duration: 4, orbScale: 0.6, color: '#fabd2f', ringColor: 'rgba(250,189,47,0.8)'  },
];

export default function MeditationBreath() {
    const [phaseIdx, setPhaseIdx] = useState(0);
    const [elapsed, setElapsed] = useState(0);   // in 100ms ticks
    const tickRef = useRef(null);

    const phase = PHASES[phaseIdx];
    const totalTicks = phase.duration * 10;
    const progress = Math.min((elapsed / totalTicks) * 100, 100);

    // Ring SVG params
    const R = 90;
    const CIRC = 2 * Math.PI * R;
    const dashOffset = CIRC - (progress / 100) * CIRC;

    useEffect(() => {
        setElapsed(0);
    }, [phaseIdx]);

    useEffect(() => {
        clearInterval(tickRef.current);
        tickRef.current = setInterval(() => {
            setElapsed(e => {
                const next = e + 1;
                if (next >= totalTicks) {
                    setPhaseIdx(pi => (pi + 1) % PHASES.length);
                    return 0;
                }
                return next;
            });
        }, 100);
        return () => clearInterval(tickRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phaseIdx]);

    // Orb scale is determined by phase — we animate it through CSS transition
    const orbScale = phase.orbScale;
    const transitionDuration = phase.duration;

    return (
        <div className="meditation-wrap">

            {/* ===== Ambient mandala petals (pure CSS/SVG) ===== */}
            <div className="meditation-mandala" aria-hidden="true">
                {[0, 60, 120, 180, 240, 300].map(deg => (
                    <div
                        key={deg}
                        className="meditation-petal"
                        style={{
                            transform: `rotate(${deg}deg)`,
                            background: `linear-gradient(to bottom, ${phase.color}50, ${phase.color}10)`,
                            transition: 'background 1.5s ease',
                        }}
                    />
                ))}
            </div>

            {/* ===== Ring arc ===== */}
            <svg className="meditation-ring-svg" viewBox="0 0 200 200" width="200" height="200" aria-hidden="true">
                {/* Track */}
                <circle cx="100" cy="100" r={R} fill="none"
                    stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                {/* Progress arc */}
                <circle
                    cx="100" cy="100" r={R}
                    fill="none"
                    stroke={phase.ringColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={CIRC}
                    strokeDashoffset={dashOffset}
                    style={{
                        transform: 'rotate(-90deg)',
                        transformOrigin: 'center',
                        transition: 'stroke-dashoffset 0.1s linear, stroke 0.8s ease',
                        filter: `drop-shadow(0 0 6px ${phase.color})`
                    }}
                />
            </svg>

            {/* ===== Breathing orb ===== */}
            <div
                className="meditation-orb"
                style={{
                    transform: `scale(${orbScale})`,
                    background: `radial-gradient(circle at 35% 30%, ${phase.color}cc, ${phase.color}40 60%, transparent)`,
                    boxShadow: `0 0 30px ${phase.color}90, 0 0 70px ${phase.color}30`,
                    transition: `transform ${transitionDuration}s cubic-bezier(0.4, 0, 0.2, 1),
                                 background ${transitionDuration * 0.5}s ease,
                                 box-shadow ${transitionDuration * 0.5}s ease`,
                }}
                aria-hidden="true"
            />

            {/* ===== Inner glow ring ===== */}
            <div
                className="meditation-inner-ring"
                style={{
                    borderColor: `${phase.color}50`,
                    transform: `scale(${orbScale * 1.35})`,
                    transition: `transform ${transitionDuration}s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.8s ease`,
                }}
                aria-hidden="true"
            />

            {/* ===== Phase label ===== */}
            <div
                className="meditation-phase-label"
                key={phaseIdx}
                style={{ color: phase.color }}
                role="status"
                aria-live="polite"
            >
                {phase.label}
            </div>

            {/* ===== Dot progress indicators ===== */}
            <div className="meditation-phase-dots" aria-hidden="true">
                {PHASES.map((p, i) => (
                    <div
                        key={i}
                        className={`meditation-phase-dot ${i === phaseIdx ? 'active' : ''} ${i < phaseIdx ? 'done' : ''}`}
                        style={i === phaseIdx ? { background: phase.color, width: '18px' } : {}}
                    />
                ))}
            </div>

            <p className="meditation-hint" aria-hidden="true">box breathing  ·  4 · 4 · 4 · 4</p>
        </div>
    );
}
