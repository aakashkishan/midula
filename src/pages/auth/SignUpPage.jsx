import { useState, useMemo } from 'react';
import { useNavigate } from '../useNavigate';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2, AlertCircle, Check, X } from 'lucide-react';
import './auth.css';

function PasswordStrength({ password }) {
    const checks = useMemo(() => ({
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    }), [password]);

    const score = Object.values(checks).filter(Boolean).length;
    const level = score <= 1 ? 'weak' : score <= 3 ? 'medium' : 'strong';
    const colors = { weak: 'var(--red)', medium: 'var(--yellow)', strong: 'var(--green)' };

    return (
        <div className="password-strength">
            <div className="password-strength-bar">
                <div className="password-strength-fill" style={{ width: `${(score / 5) * 100}%`, background: colors[level] }} />
            </div>
            <span className={`password-strength-label ${level}`}>{level}</span>
            <ul className="password-requirements">
                {[
                    { key: 'length', label: 'At least 8 characters' },
                    { key: 'upper', label: 'One uppercase letter' },
                    { key: 'lower', label: 'One lowercase letter' },
                    { key: 'number', label: 'One number' },
                    { key: 'special', label: 'One special character' },
                ].map(({ key, label }) => (
                    <li key={key} className={checks[key] ? 'req-met' : ''}>
                        {checks[key] ? <Check size={14} /> : <X size={14} />}
                        {label}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [terms, setTerms] = useState(false);
    const [privacy, setPrivacy] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const passwordsMatch = confirm === password && confirm.length > 0;
    const allChecks = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
    const canSubmit = allChecks && passwordsMatch && terms && privacy && email.includes('@');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!canSubmit) return;
        setLoading(true);
        const { error: err } = await signUp(email, password);
        if (err) setError(err.message || 'Failed to create account');
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <button className="auth-back-btn" onClick={() => navigate('/auth/signin')} aria-label="Back to sign in">
                    <ArrowLeft size={20} />
                </button>
                <div className="auth-header">
                    <h1>Create account 🚀</h1>
                    <p>Start your health journey today</p>
                </div>

                {error && <div className="auth-error"><AlertCircle size={16} /><span>{error}</span></div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label>Email</label>
                        <div className="auth-input-wrap">
                            <Mail size={18} className="auth-input-icon" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label>Password</label>
                        <div className="auth-input-wrap">
                            <Lock size={18} className="auth-input-icon" />
                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" required />
                            <button type="button" className="auth-toggle-pass" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                        </div>
                        {password && <PasswordStrength password={password} />}
                    </div>

                    <div className="auth-field">
                        <label>Confirm Password</label>
                        <div className={`auth-input-wrap ${!passwordsMatch && confirm ? 'input-error' : ''}`}>
                            <Lock size={18} className="auth-input-icon" />
                            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" autoComplete="new-password" required />
                        </div>
                        {!passwordsMatch && confirm && <span className="auth-field-error">Passwords don't match</span>}
                    </div>

                    <label className="auth-checkbox">
                        <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} required />
                        <span>I agree to the <button type="button" className="auth-link-btn-inline">Terms of Service</button></span>
                    </label>
                    <label className="auth-checkbox">
                        <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} required />
                        <span>I agree to the <button type="button" className="auth-link-btn-inline">Privacy Policy</button></span>
                    </label>

                    <button type="submit" className="auth-btn-primary" disabled={!canSubmit || loading}>
                        {loading ? <Loader2 size={20} className="spin" /> : 'Create Account'}
                    </button>
                </form>

                <p className="auth-footer">Already have an account? <button className="auth-link-btn" onClick={() => navigate('/auth/signin')}>Sign In</button></p>
            </div>
        </div>
    );
}
