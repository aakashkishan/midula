import { useState } from 'react';
import { useNavigate } from '../useNavigate';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import './auth.css';

const STEPS = ['Basic Info', 'Body Metrics', 'Goals', 'Diet', 'Health'];

export default function OnboardingPage() {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        full_name: '', date_of_birth: '', gender: '',
        height_cm: '', weight_kg: '', height_ft: '', height_in: '', weight_lbs: '',
        height_unit: 'cm', weight_unit: 'kg',
        fitness_level: '', primary_goals: [], target_weight_kg: '', weekly_workout_target: 3,
        diet_type: '', food_allergies: [], meal_preference: '',
        medical_conditions: '', injury_history: '', sleep_target_hours: 8,
    });

    const update = (key, val) => setForm(f => ({ ...f, [key]: val }));
    const toggleArray = (key, val) => setForm(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val] }));

    const canContinue = () => {
        switch (step) {
            case 0: return form.full_name && form.date_of_birth && form.gender;
            case 1: return (form.height_unit === 'cm' ? form.height_cm : (form.height_ft && form.height_in)) && (form.weight_unit === 'kg' ? form.weight_kg : form.weight_lbs) && form.fitness_level;
            case 2: return form.primary_goals.length > 0;
            case 3: return form.diet_type;
            case 4: return true;
            default: return false;
        }
    };

    const goNext = () => { if (step < 4) setStep(s => s + 1); };
    const goBack = () => { if (step > 0) setStep(s => s - 1); };

    const finish = async () => {
        setLoading(true);
        let data = { ...form };
        if (form.height_unit === 'ft-in') {
            data.height_cm = Math.round((parseFloat(form.height_ft || 0) * 30.48) + (parseFloat(form.height_in || 0) * 2.54));
            delete data.height_ft;
            delete data.height_in;
        }
        if (form.weight_unit === 'lbs') {
            data.weight_kg = Math.round(parseFloat(form.weight_lbs || 0) * 0.453592);
            delete data.weight_lbs;
        }
        delete data.height_unit;
        delete data.weight_unit;

        const { error } = await updateProfile(data);
        setLoading(false);
        if (!error) {
            confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
            navigate('/');
        }
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <div className="onboard-step">
                        <h2>Basic Info</h2>
                        <p>Tell us about yourself</p>
                        <div className="auth-field">
                            <label>Full Name</label>
                            <input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} placeholder="Your name" />
                        </div>
                        <div className="auth-field">
                            <label>Date of Birth</label>
                            <input type="date" value={form.date_of_birth} onChange={(e) => update('date_of_birth', e.target.value)} max={new Date(Date.now() - 13 * 365 * 86400000).toISOString().split('T')[0]} />
                        </div>
                        <div className="auth-field">
                            <label>Gender</label>
                            <div className="auth-radio-group">
                                {['male', 'female', 'other', 'prefer_not'].map(g => (
                                    <button key={g} type="button" className={`auth-radio-card ${form.gender === g ? 'active' : ''}`} onClick={() => update('gender', g)}>
                                        {g === 'male' ? '♂️ Male' : g === 'female' ? '♀️ Female' : g === 'other' ? '🏳️ Other' : '🔒 Prefer not'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="onboard-step">
                        <h2>Body Metrics</h2>
                        <p>Help us personalize your plan</p>
                        <div className="auth-field">
                            <label>Height</label>
                            <div className="auth-unit-toggle">
                                <button className={form.height_unit === 'cm' ? 'active' : ''} onClick={() => update('height_unit', 'cm')}>cm</button>
                                <button className={form.height_unit === 'ft-in' ? 'active' : ''} onClick={() => update('height_unit', 'ft-in')}>ft/in</button>
                            </div>
                            {form.height_unit === 'cm' ? (
                                <input type="number" value={form.height_cm} onChange={(e) => update('height_cm', e.target.value)} placeholder="170" />
                            ) : (
                                <div className="auth-row-inputs">
                                    <input type="number" value={form.height_ft} onChange={(e) => update('height_ft', e.target.value)} placeholder="5" />
                                    <span>'</span>
                                    <input type="number" value={form.height_in} onChange={(e) => update('height_in', e.target.value)} placeholder="7" />
                                    <span>"</span>
                                </div>
                            )}
                        </div>
                        <div className="auth-field">
                            <label>Weight</label>
                            <div className="auth-unit-toggle">
                                <button className={form.weight_unit === 'kg' ? 'active' : ''} onClick={() => update('weight_unit', 'kg')}>kg</button>
                                <button className={form.weight_unit === 'lbs' ? 'active' : ''} onClick={() => update('weight_unit', 'lbs')}>lbs</button>
                            </div>
                            <input type="number" value={form.weight_unit === 'kg' ? form.weight_kg : form.weight_lbs} onChange={(e) => update(form.weight_unit === 'kg' ? 'weight_kg' : 'weight_lbs', e.target.value)} placeholder={form.weight_unit === 'kg' ? '70' : '154'} />
                        </div>
                        <div className="auth-field">
                            <label>Fitness Level</label>
                            <div className="auth-radio-group">
                                {[['beginner', '🌱', 'New to fitness'], ['intermediate', '💪', 'Some experience'], ['advanced', '🏆', 'Regular athlete']].map(([val, emoji, desc]) => (
                                    <button key={val} type="button" className={`auth-radio-card ${form.fitness_level === val ? 'active' : ''}`} onClick={() => update('fitness_level', val)}>
                                        <span className="auth-radio-emoji">{emoji}</span>
                                        <strong>{val.charAt(0).toUpperCase() + val.slice(1)}</strong>
                                        <span>{desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="onboard-step">
                        <h2>Your Goals</h2>
                        <p>What do you want to achieve?</p>
                        <div className="auth-field">
                            <label>Primary Goals (select all that apply)</label>
                            <div className="auth-checkbox-grid">
                                {[['Lose Weight', '🏋️'], ['Build Muscle', '💪'], ['Stay Fit', '🧘'], ['Improve Flexibility', '🤸'], ['Reduce Stress', '🧠'], ['Build Endurance', '🏃']].map(([label, emoji]) => (
                                    <button key={label} type="button" className={`auth-check-card ${form.primary_goals.includes(label) ? 'active' : ''}`} onClick={() => toggleArray('primary_goals', label)}>
                                        {emoji} {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="auth-field">
                            <label>Weekly Workout Target: {form.weekly_workout_target} days</label>
                            <input type="range" min="1" max="7" value={form.weekly_workout_target} onChange={(e) => update('weekly_workout_target', parseInt(e.target.value))} className="auth-slider" />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="onboard-step">
                        <h2>Dietary Preferences</h2>
                        <p>Help us suggest the right meals</p>
                        <div className="auth-field">
                            <label>Diet Type</label>
                            <div className="auth-radio-group">
                                {[['vegetarian', '🥬', 'Vegetarian'], ['vegan', '🌱', 'Vegan'], ['jain', '🕉️', 'Jain'], ['other', '🍽️', 'Other']].map(([val, emoji, label]) => (
                                    <button key={val} type="button" className={`auth-radio-card ${form.diet_type === val ? 'active' : ''}`} onClick={() => update('diet_type', val)}>
                                        {emoji} {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="auth-field">
                            <label>Food Allergies</label>
                            <div className="auth-checkbox-grid">
                                {['Nuts', 'Dairy', 'Gluten', 'Soy', 'Eggs', 'None'].map(a => (
                                    <button key={a} type="button" className={`auth-check-card ${form.food_allergies.includes(a) ? 'active' : ''}`} onClick={() => toggleArray('food_allergies', a)}>{a}</button>
                                ))}
                            </div>
                        </div>
                        <div className="auth-field">
                            <label>Meal Preference</label>
                            <div className="auth-radio-group">
                                {[['Home-cooked', '🏠'], ['Restaurant', '🍽️'], ['Mixed', '🔄']].map(([val, emoji]) => (
                                    <button key={val} type="button" className={`auth-radio-card ${form.meal_preference === val ? 'active' : ''}`} onClick={() => update('meal_preference', val)}>{emoji} {val}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="onboard-step">
                        <h2>Health Info</h2>
                        <p>Optional — helps us keep you safe</p>
                        <div className="auth-field">
                            <label>Medical Conditions (optional)</label>
                            <textarea value={form.medical_conditions} onChange={(e) => update('medical_conditions', e.target.value)} placeholder="Any conditions we should know about..." rows={3} />
                        </div>
                        <div className="auth-field">
                            <label>Injury History (optional)</label>
                            <textarea value={form.injury_history} onChange={(e) => update('injury_history', e.target.value)} placeholder="Past injuries that may affect workouts..." rows={3} />
                        </div>
                        <div className="auth-field">
                            <label>Sleep Target: {form.sleep_target_hours} hours</label>
                            <input type="range" min="4" max="12" value={form.sleep_target_hours} onChange={(e) => update('sleep_target_hours', parseInt(e.target.value))} className="auth-slider" />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card onboard-card">
                <div className="onboard-progress">
                    {STEPS.map((s, i) => (
                        <div key={s} className={`onboard-progress-step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                            <div className="onboard-progress-dot">{i < step ? <Check size={12} /> : i + 1}</div>
                            <span className="onboard-progress-label">{s}</span>
                        </div>
                    ))}
                </div>
                {renderStep()}
                <div className="onboard-actions">
                    {step > 0 && <button className="auth-btn-secondary" onClick={goBack}><ArrowLeft size={18} /> Back</button>}
                    {step < 4 ? (
                        <button className="auth-btn-primary" onClick={goNext} disabled={!canContinue()}>Continue <ArrowRight size={18} /></button>
                    ) : (
                        <button className="auth-btn-primary" onClick={finish} disabled={loading}>
                            {loading ? <Loader2 size={20} className="spin" /> : <>Complete Setup <Check size={18} /></>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
