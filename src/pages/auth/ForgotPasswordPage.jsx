import { useState } from 'react';
import { useNavigate } from '../useNavigate';
import { useAuth } from '../../context/AuthContext';
import { Mail, ArrowLeft, Loader2, Check, AlertCircle } from 'lucide-react';
import './auth.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { error: err } = await resetPassword(email);
        if (err) setError(err.message || 'Failed to send reset email');
        else setSent(true);
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <button className="auth-back-btn" onClick={() => navigate('/auth/signin')} aria-label="Back to sign in">
                    <ArrowLeft size={20} />
                </button>
                <div className="auth-header">
                    <h1>Reset password 🔑</h1>
                    <p>We'll send you a link to reset your password</p>
                </div>
                {error && <div className="auth-error"><AlertCircle size={16} /><span>{error}</span></div>}
                {sent ? (
                    <div className="auth-success" style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <Check size={48} style={{ marginBottom: '1rem' }} />
                        <h3>Check your email</h3>
                        <p>We sent a reset link to {email}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-field">
                            <label>Email</label>
                            <div className="auth-input-wrap">
                                <Mail size={18} className="auth-input-icon" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                            </div>
                        </div>
                        <button type="submit" className="auth-btn-primary" disabled={loading}>
                            {loading ? <Loader2 size={20} className="spin" /> : 'Send Reset Link'}
                        </button>
                    </form>
                )}
                <p className="auth-footer">
                    Remember your password? <button className="auth-link-btn" onClick={() => navigate('/auth/signin')}>Sign In</button>
                </p>
            </div>
        </div>
    );
}
