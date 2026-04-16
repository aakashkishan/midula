import { useMemo } from 'react';
import './ExerciseVideo.css';

// Map exercise names to simple SVG pose illustrations
// These are self-contained, no external API needed
const EXERCISE_POSES = {
    'High Knees': 'high-knees',
    'Plank Hold': 'plank',
    'Bicycle Crunches': 'bicycle-crunch',
    'Mountain Climbers': 'mountain-climber',
    'Dead Bug': 'dead-bug',
    'Jumping Jacks': 'jumping-jacks',
    'Burpees': 'burpee',
    'Squat Jumps': 'squat-jump',
    'Child\'s Pose': 'child-pose',
    'Downward Dog': 'downward-dog',
    'Warrior II': 'warrior',
    'Side Plank': 'side-plank',
    'Glute Bridge': 'glute-bridge',
    'Warm-up Walk': 'walk',
    'Brisk Walk': 'walk',
    'High Knees Walk': 'high-knees',
    'Cool-down Walk': 'walk',
    'Warrior Stretch': 'warrior',
};

// Simple SVG exercise illustrations as inline components
function ExerciseIllustration({ pose, isAnimating }) {
    const svgContent = useMemo(() => {
        switch (pose) {
            case 'high-knees':
                return (
                    <g>
                        {/* Standing figure with one knee raised */}
                        <circle cx="150" cy="60" r="18" fill="var(--aqua)" opacity="0.8" />
                        <line x1="150" y1="78" x2="150" y2="140" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="150" y1="140" x2="130" y2="200" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="150" y1="140" x2="170" y2="180" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" className={isAnimating ? 'animate-knee' : ''} />
                        <line x1="150" y1="95" x2="120" y2="120" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="150" y1="95" x2="180" y2="120" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        {/* Ground line */}
                        <line x1="50" y1="210" x2="250" y2="210" stroke="var(--bg2)" strokeWidth="2" />
                    </g>
                );
            case 'plank':
                return (
                    <g>
                        {/* Plank figure - horizontal line */}
                        <circle cx="220" cy="120" r="16" fill="var(--aqua)" opacity="0.8" />
                        <line x1="200" y1="130" x2="100" y2="150" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="100" y1="150" x2="60" y2="200" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="180" y1="140" x2="140" y2="200" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="60" y1="200" x2="140" y2="200" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        {/* Ground line */}
                        <line x1="50" y1="210" x2="250" y2="210" stroke="var(--bg2)" strokeWidth="2" />
                    </g>
                );
            case 'bicycle-crunch':
                return (
                    <g>
                        {/* Lying figure with alternating knee-to-elbow */}
                        <circle cx="80" cy="170" r="16" fill="var(--aqua)" opacity="0.8" />
                        <line x1="95" y1="175" x2="140" y2="180" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="140" y1="180" x2="180" y2="200" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="140" y1="180" x2="170" y2="160" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" className={isAnimating ? 'animate-crunch' : ''} />
                        <line x1="110" y1="175" x2="130" y2="140" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="110" y1="175" x2="90" y2="140" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" className={isAnimating ? 'animate-elbow' : ''} />
                        {/* Ground line */}
                        <line x1="50" y1="210" x2="250" y2="210" stroke="var(--bg2)" strokeWidth="2" />
                    </g>
                );
            case 'mountain-climber':
                return (
                    <g>
                        {/* Plank position with knee drive */}
                        <circle cx="210" cy="100" r="16" fill="var(--aqua)" opacity="0.8" />
                        <line x1="195" y1="112" x2="120" y2="130" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="120" y1="130" x2="80" y2="200" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="120" y1="130" x2="100" y2="200" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="160" y1="120" x2="170" y2="160" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" className={isAnimating ? 'animate-climber' : ''} />
                        <line x1="150" y1="125" x2="110" y2="200" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        {/* Ground line */}
                        <line x1="50" y1="210" x2="250" y2="210" stroke="var(--bg2)" strokeWidth="2" />
                    </g>
                );
            case 'dead-bug':
                return (
                    <g>
                        {/* Lying on back, opposite arm/leg extended */}
                        <circle cx="80" cy="175" r="16" fill="var(--aqua)" opacity="0.8" />
                        <line x1="95" y1="178" x2="140" y2="180" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="140" y1="180" x2="190" y2="180" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="140" y1="180" x2="170" y2="130" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" className={isAnimating ? 'animate-deadbug-arm' : ''} />
                        <line x1="120" y1="180" x2="150" y2="200" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" className={isAnimating ? 'animate-deadbug-leg' : ''} />
                        {/* Ground line */}
                        <line x1="50" y1="210" x2="250" y2="210" stroke="var(--bg2)" strokeWidth="2" />
                    </g>
                );
            case 'jumping-jacks':
                return (
                    <g>
                        {/* Star figure */}
                        <circle cx="150" cy="50" r="18" fill="var(--aqua)" opacity="0.8" />
                        <line x1="150" y1="68" x2="150" y2="130" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="150" y1="85" x2="90" y2="60" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" className={isAnimating ? 'animate-jack-arm' : ''} />
                        <line x1="150" y1="85" x2="210" y2="60" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" className={isAnimating ? 'animate-jack-arm' : ''} />
                        <line x1="150" y1="130" x2="110" y2="200" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" className={isAnimating ? 'animate-jack-leg' : ''} />
                        <line x1="150" y1="130" x2="190" y2="200" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" className={isAnimating ? 'animate-jack-leg' : ''} />
                        {/* Ground line */}
                        <line x1="50" y1="210" x2="250" y2="210" stroke="var(--bg2)" strokeWidth="2" />
                    </g>
                );
            case 'burpee':
                return (
                    <g>
                        {/* Squat position with hands on ground */}
                        <circle cx="110" cy="140" r="16" fill="var(--aqua)" opacity="0.8" />
                        <line x1="120" y1="150" x2="140" y2="180" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="140" y1="180" x2="100" y2="200" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="140" y1="180" x2="180" y2="200" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="130" y1="160" x2="160" y2="200" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="125" y1="165" x2="190" y2="200" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        {/* Ground line */}
                        <line x1="50" y1="210" x2="250" y2="210" stroke="var(--bg2)" strokeWidth="2" />
                    </g>
                );
            case 'squat-jump':
                return (
                    <g>
                        {/* Mid-air squat jump */}
                        <circle cx="150" cy="60" r="18" fill="var(--aqua)" opacity="0.8" />
                        <line x1="150" y1="78" x2="150" y2="120" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="150" y1="120" x2="120" y2="160" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="150" y1="120" x2="180" y2="160" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="150" y1="90" x2="110" y2="100" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="150" y1="90" x2="190" y2="100" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        {/* Ground line */}
                        <line x1="50" y1="200" x2="250" y2="200" stroke="var(--bg2)" strokeWidth="2" />
                        {/* Jump arrows */}
                        <path d="M 140 180 L 140 170 M 150 185 L 150 170 M 160 180 L 160 170" stroke="var(--yellow)" strokeWidth="2" opacity="0.5" />
                    </g>
                );
            case 'child-pose':
                return (
                    <g>
                        {/* Child's pose - kneeling with torso forward */}
                        <circle cx="90" cy="160" r="16" fill="var(--purple)" opacity="0.8" />
                        <line x1="105" y1="165" x2="150" y2="150" stroke="var(--purple)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="150" y1="150" x2="180" y2="170" stroke="var(--purple)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="150" y1="150" x2="170" y2="175" stroke="var(--purple)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="120" y1="160" x2="110" y2="170" stroke="var(--purple)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="125" y1="158" x2="120" y2="170" stroke="var(--purple)" strokeWidth="4" strokeLinecap="round" />
                        {/* Ground/mat line */}
                        <line x1="50" y1="200" x2="250" y2="200" stroke="var(--bg2)" strokeWidth="2" />
                    </g>
                );
            case 'downward-dog':
                return (
                    <g>
                        {/* Inverted V shape */}
                        <circle cx="80" cy="160" r="16" fill="var(--purple)" opacity="0.8" />
                        <line x1="95" y1="155" x2="150" y2="80" stroke="var(--purple)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="150" y1="80" x2="200" y2="150" stroke="var(--purple)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="200" y1="150" x2="210" y2="200" stroke="var(--purple)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="80" y1="170" x2="70" y2="200" stroke="var(--purple)" strokeWidth="4" strokeLinecap="round" />
                        {/* Ground/mat line */}
                        <line x1="50" y1="210" x2="250" y2="210" stroke="var(--bg2)" strokeWidth="2" />
                    </g>
                );
            case 'warrior':
                return (
                    <g>
                        {/* Warrior II stance */}
                        <circle cx="130" cy="60" r="18" fill="var(--purple)" opacity="0.8" />
                        <line x1="130" y1="78" x2="130" y2="140" stroke="var(--purple)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="130" y1="140" x2="90" y2="200" stroke="var(--purple)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="130" y1="140" x2="170" y2="200" stroke="var(--purple)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="130" y1="95" x2="70" y2="95" stroke="var(--purple)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="130" y1="95" x2="190" y2="95" stroke="var(--purple)" strokeWidth="4" strokeLinecap="round" />
                        {/* Ground/mat line */}
                        <line x1="50" y1="210" x2="250" y2="210" stroke="var(--bg2)" strokeWidth="2" />
                    </g>
                );
            case 'side-plank':
                return (
                    <g>
                        {/* Side plank - side view */}
                        <circle cx="140" cy="100" r="16" fill="var(--aqua)" opacity="0.8" />
                        <line x1="140" y1="116" x2="140" y2="180" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="140" y1="180" x2="180" y2="200" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="140" y1="130" x2="120" y2="200" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="140" y1="120" x2="170" y2="80" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        {/* Ground line */}
                        <line x1="50" y1="210" x2="250" y2="210" stroke="var(--bg2)" strokeWidth="2" />
                    </g>
                );
            case 'glute-bridge':
                return (
                    <g>
                        {/* Bridge position - hips lifted */}
                        <circle cx="80" cy="160" r="16" fill="var(--aqua)" opacity="0.8" />
                        <line x1="95" y1="155" x2="140" y2="120" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="140" y1="120" x2="180" y2="140" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="180" y1="140" x2="200" y2="200" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="80" y1="175" x2="120" y2="200" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        {/* Ground line */}
                        <line x1="50" y1="210" x2="250" y2="210" stroke="var(--bg2)" strokeWidth="2" />
                        {/* Up arrow */}
                        <path d="M 140 100 L 140 85 M 135 90 L 140 85 L 145 90" stroke="var(--yellow)" strokeWidth="2" opacity="0.6" />
                    </g>
                );
            case 'walk':
            default:
                return (
                    <g>
                        {/* Walking figure */}
                        <circle cx="130" cy="70" r="18" fill="var(--aqua)" opacity="0.8" />
                        <line x1="130" y1="88" x2="130" y2="140" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" />
                        <line x1="130" y1="140" x2="110" y2="200" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" className={isAnimating ? 'animate-walk-leg' : ''} />
                        <line x1="130" y1="140" x2="150" y2="200" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" className={isAnimating ? 'animate-walk-leg' : ''} />
                        <line x1="130" y1="105" x2="105" y2="130" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" className={isAnimating ? 'animate-walk-arm' : ''} />
                        <line x1="130" y1="105" x2="155" y2="130" stroke="var(--aqua)" strokeWidth="4" strokeLinecap="round" className={isAnimating ? 'animate-walk-arm' : ''} />
                        {/* Ground line */}
                        <line x1="50" y1="210" x2="250" y2="210" stroke="var(--bg2)" strokeWidth="2" />
                    </g>
                );
        }
    }, [pose, isAnimating]);

    return (
        <svg viewBox="0 0 300 240" className="exercise-svg">
            {svgContent}
        </svg>
    );
}

export default function ExerciseVideo({ exerciseName, isRest }) {
    const poseKey = EXERCISE_POSES[exerciseName] || 'walk';

    // Rest state - show breathing animation
    if (isRest) {
        return (
            <div className="exercise-video-container">
                <div className="exercise-rest-placeholder">
                    <div className="rest-breath-circle"></div>
                    <span className="rest-text">Breathe...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="exercise-video-container">
            <ExerciseIllustration pose={poseKey} isAnimating={true} />
        </div>
    );
}
