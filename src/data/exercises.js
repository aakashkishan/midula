// Midula Exercise Data
// Each routine has exercises with duration, rest, illustration frames, and coaching tips.
// frame1 + frame2 create a flipbook animation showing the exercise motion arc.
// speed: 'slow' = yoga/pilates (1200ms), 'normal' = core/walk (800ms), 'fast' = HIIT/CrossFit (500ms)
// muscles: primary muscle groups targeted (shown as badge in the animation panel)
// All rest periods: 30 seconds for proper breathing/recovery time

export const routineExercises = {
    1: {
        name: 'Beginner Core Flow',
        category: 'CORE',
        speed: 'normal',
        rounds: 3,
        exercises: [
            {
                name: 'High Knees',
                duration: 30, rest: 30,
                frame1: '/exercises/high_knees.png',
                frame2: '/exercises/high_knees_2.png',
                muscles: 'Hips · Cardio',
                tip: 'Drive knees to hip height, pump your arms in rhythm'
            },
            {
                name: 'Plank Hold',
                duration: 30, rest: 30,
                frame1: '/exercises/plank.png',
                frame2: null,
                muscles: 'Core · Shoulders',
                tip: 'Brace your core like you\'re bracing for a punch — do not sag'
            },
            {
                name: 'Bicycle Crunches',
                duration: 30, rest: 30,
                frame1: '/exercises/bicycle_crunch.png',
                frame2: '/exercises/bicycle_crunch_2.png',
                muscles: 'Obliques · Abs',
                tip: 'Rotate your torso fully — elbow to opposite knee on each rep'
            },
            {
                name: 'Mountain Climbers',
                duration: 30, rest: 30,
                frame1: '/exercises/mountain_climber.png',
                frame2: '/exercises/mountain_climber_2.png',
                muscles: 'Core · Hip Flexors',
                tip: 'Keep hips low and level — don\'t let them bounce up'
            },
            {
                name: 'Dead Bug',
                duration: 30, rest: 30,
                frame1: '/exercises/dead_bug.png',
                frame2: '/exercises/dead_bug_2.png',
                muscles: 'Deep Core · Stability',
                tip: 'Press your lower back firmly into the floor throughout'
            },
        ]
    },
    2: {
        name: 'HIIT Cardio Blast',
        category: 'HIIT',
        speed: 'fast',
        rounds: 4,
        exercises: [
            {
                name: 'Jumping Jacks',
                duration: 40, rest: 20,
                frame1: '/exercises/jumping_jack.png',
                frame2: '/exercises/jumping_jack_2.png',
                muscles: 'Full Body · Cardio',
                tip: 'Full range of motion — arms fully overhead, feet wide'
            },
            {
                name: 'Burpees',
                duration: 30, rest: 30,
                frame1: '/exercises/burpee.png',
                frame2: '/exercises/burpee_2.png',
                muscles: 'Full Body · Explosive',
                tip: 'Explode up from the squat — use your hips, not just your legs'
            },
            {
                name: 'High Knees Sprint',
                duration: 30, rest: 20,
                frame1: '/exercises/high_knees.png',
                frame2: '/exercises/high_knees_2.png',
                muscles: 'Cardio · Hip Flexors',
                tip: 'Pump arms aggressively to drive knee height'
            },
            {
                name: 'Squat Jumps',
                duration: 30, rest: 30,
                frame1: '/exercises/squat_jump.png',
                frame2: '/exercises/squat_jump_2.png',
                muscles: 'Quads · Glutes · Power',
                tip: 'Land softly with bent knees — sit back into the squat immediately'
            },
            {
                name: 'Mountain Climbers',
                duration: 30, rest: 30,
                frame1: '/exercises/mountain_climber.png',
                frame2: '/exercises/mountain_climber_2.png',
                muscles: 'Core · Shoulders',
                tip: 'Fast feet — maintain plank form as you drive each knee in'
            },
        ]
    },
    3: {
        name: 'Yoga & Stretch',
        category: 'YOGA',
        speed: 'slow',
        rounds: 2,
        exercises: [
            {
                name: "Child's Pose",
                duration: 45, rest: 20,
                frame1: '/exercises/child_pose.png',
                frame2: null,
                muscles: 'Back · Hips · Shoulders',
                tip: 'Melt into the floor with every exhale — let your arms go heavy'
            },
            {
                name: 'Downward Dog',
                duration: 45, rest: 20,
                frame1: '/exercises/downward_dog.png',
                frame2: null,
                muscles: 'Hamstrings · Calves · Back',
                tip: 'Press heels toward the floor and lengthen through your spine'
            },
            {
                name: 'Warrior II',
                duration: 40, rest: 20,
                frame1: '/exercises/warrior.png',
                frame2: null,
                muscles: 'Quads · Hip Flexors · Core',
                tip: 'Front knee stacks directly over your ankle — gaze over your fingertips'
            },
            {
                name: 'Plank Hold',
                duration: 30, rest: 20,
                frame1: '/exercises/plank.png',
                frame2: null,
                muscles: 'Core · Shoulders',
                tip: 'Breathe steadily — you\'re building functional strength'
            },
            {
                name: "Child's Pose",
                duration: 45, rest: 15,
                frame1: '/exercises/child_pose.png',
                frame2: null,
                muscles: 'Full Body · Recovery',
                tip: 'Final rest — feel your breath, let every muscle release'
            },
        ]
    },
    4: {
        name: 'Pilates Sculpt',
        category: 'PILATES',
        speed: 'slow',
        rounds: 3,
        exercises: [
            {
                name: 'Bicycle Crunches',
                duration: 40, rest: 30,
                frame1: '/exercises/bicycle_crunch.png',
                frame2: '/exercises/bicycle_crunch_2.png',
                muscles: 'Obliques · Abs',
                tip: 'Slow and deliberate — feel the full rotational contraction on each rep'
            },
            {
                name: 'Dead Bug',
                duration: 35, rest: 30,
                frame1: '/exercises/dead_bug.png',
                frame2: '/exercises/dead_bug_2.png',
                muscles: 'Deep Core · Transversus Abdominis',
                tip: 'Exhale as you lower — keep lower back completely flat on the floor'
            },
            {
                name: 'Side Plank',
                duration: 30, rest: 30,
                frame1: '/exercises/side_plank.png',
                frame2: null,
                muscles: 'Obliques · Hip Abductors',
                tip: 'Stack your feet, lift your hips high — form a perfect diagonal line'
            },
            {
                name: 'Glute Bridge',
                duration: 35, rest: 30,
                frame1: '/exercises/glute_bridge.png',
                frame2: '/exercises/glute_bridge_2.png',
                muscles: 'Glutes · Hamstrings · Core',
                tip: 'Squeeze at the top for a full second — drive through your heels'
            },
            {
                name: 'Plank Hold',
                duration: 30, rest: 30,
                frame1: '/exercises/plank.png',
                frame2: null,
                muscles: 'Core · Stability',
                tip: 'Final hold — breathe, control, stay strong!'
            },
        ]
    },
    5: {
        name: 'Evening Walk',
        category: 'WALK',
        speed: 'normal',
        rounds: 1,
        exercises: [
            {
                name: 'Warm-up Walk',
                duration: 120, rest: 30,
                frame1: '/exercises/walk.png',
                frame2: '/exercises/walk_2.png',
                muscles: 'Full Body · Circulation',
                tip: 'Easy, relaxed pace — swing your arms naturally'
            },
            {
                name: 'Brisk Walk',
                duration: 300, rest: 30,
                frame1: '/exercises/walk.png',
                frame2: '/exercises/walk_2.png',
                muscles: 'Cardio · Legs · Endurance',
                tip: 'Pick up the pace — engage your core and drive with your arms'
            },
            {
                name: 'High Knees Walk',
                duration: 60, rest: 30,
                frame1: '/exercises/high_knees.png',
                frame2: '/exercises/high_knees_2.png',
                muscles: 'Hip Flexors · Core',
                tip: 'Exaggerate the knee lift — feel your hip flexors working'
            },
            {
                name: 'Cool-down Walk',
                duration: 120, rest: 30,
                frame1: '/exercises/walk.png',
                frame2: '/exercises/walk_2.png',
                muscles: 'Full Body · Recovery',
                tip: 'Slow down gradually — breathe deeply and reset your heart rate'
            },
            {
                name: 'Warrior Stretch',
                duration: 60, rest: 30,
                frame1: '/exercises/warrior.png',
                frame2: null,
                muscles: 'Hip Flexors · Quads',
                tip: 'Hold each side for 30 seconds — feel the hip flexor open'
            },
        ]
    },
    6: {
        name: 'CrossFit Metcon Burn',
        category: 'CROSSFIT',
        speed: 'fast',
        rounds: 3,
        exercises: [
            {
                name: 'Box Jumps',
                duration: 40, rest: 30,
                frame1: '/exercises/box_jump.png',
                frame2: '/exercises/box_jump_2.png',
                muscles: 'Quads · Glutes · Explosive Power',
                tip: 'Land softly with both feet fully on the box — step back down, never jump off'
            },
            {
                name: 'Kettlebell Swings',
                duration: 40, rest: 30,
                frame1: '/exercises/kettlebell_swing.png',
                frame2: '/exercises/kettlebell_swing_2.png',
                muscles: 'Glutes · Hamstrings · Core',
                tip: 'It\'s a hip hinge — drive hips forward explosively, arms just guide the bell'
            },
            {
                name: 'Wall Balls',
                duration: 40, rest: 30,
                frame1: '/exercises/wall_ball.png',
                frame2: '/exercises/wall_ball_2.png',
                muscles: 'Quads · Shoulders · Full Body',
                tip: 'Squat below parallel — use that stored energy to explode and throw'
            },
            {
                name: 'Battle Rope Slams',
                duration: 30, rest: 30,
                frame1: '/exercises/rope_slam.png',
                frame2: '/exercises/rope_slam_2.png',
                muscles: 'Shoulders · Lats · Core · Cardio',
                tip: 'Drive arms down with full force — this is power output, not endurance'
            },
            {
                name: 'Thrusters',
                duration: 40, rest: 40,
                frame1: '/exercises/thrusters.png',
                frame2: '/exercises/thrusters_2.png',
                muscles: 'Quads · Shoulders · Full Body',
                tip: 'Use the momentum from the squat to drive the bar overhead — one fluid motion'
            },
        ]
    },
    7: {
        name: 'Power HIIT',
        category: 'HIIT',
        speed: 'fast',
        rounds: 4,
        exercises: [
            {
                name: 'Sprint In Place',
                duration: 30, rest: 20,
                frame1: '/exercises/sprint_arms.png',
                frame2: '/exercises/sprint_arms_2.png',
                muscles: 'Cardio · Full Body',
                tip: 'Maximum effort — drive knee and arm simultaneously for speed'
            },
            {
                name: 'Lateral Shuffles',
                duration: 30, rest: 20,
                frame1: '/exercises/lateral_shuffle.png',
                frame2: '/exercises/lateral_shuffle_2.png',
                muscles: 'Inner Thighs · Glutes · Agility',
                tip: 'Stay low in your athletic stance — never let your feet cross'
            },
            {
                name: 'Tuck Jumps',
                duration: 30, rest: 30,
                frame1: '/exercises/tuck_jump.png',
                frame2: '/exercises/tuck_jump_2.png',
                muscles: 'Quads · Core · Explosive Power',
                tip: 'Drive knees up to chest — land quietly to protect your joints'
            },
            {
                name: 'Push-Ups',
                duration: 30, rest: 30,
                frame1: '/exercises/push_up.png',
                frame2: '/exercises/push_up_2.png',
                muscles: 'Chest · Triceps · Core',
                tip: 'Elbows at 45° — maintain a rigid plank from head to heels throughout'
            },
            {
                name: 'Speed Skaters',
                duration: 30, rest: 30,
                frame1: '/exercises/speed_skater.png',
                frame2: '/exercises/speed_skater_2.png',
                muscles: 'Glutes · Inner Thighs · Coordination',
                tip: 'Reach toward the landing foot on every side — this deepens the hip load'
            },
        ]
    }
};
