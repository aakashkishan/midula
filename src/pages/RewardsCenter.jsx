import { useState } from 'react';
import { useCouponRewards } from '../hooks/useCouponRewards';
import { getCouponsForMilestone, milestoneValues } from '../data/coupons';
import { ArrowLeft, Gift, Check } from 'lucide-react';
import CouponCard from '../components/CouponCard';
import './auth/auth.css';

const MILESTONES = [3, 7, 14, 30];

export default function RewardsCenter({ currentStreak, onBack }) {
    const [activeMilestone, setActiveMilestone] = useState(MILESTONES.find(m => currentStreak >= m) || 3);
    const [toast, setToast] = useState('');
    const { claimed, claimCoupon, copyCode, getUnlockedCoupons } = useCouponRewards(currentStreak >= activeMilestone ? activeMilestone : null);

    const unlockedCoupons = getUnlockedCoupons();
    const milestoneCoupons = getCouponsForMilestone(activeMilestone);
    const isUnlocked = currentStreak >= activeMilestone;

    const handleCopy = async (code) => {
        const ok = await copyCode(code);
        if (ok) { setToast('Code copied!'); setTimeout(() => setToast(''), 3000); }
    };

    const nextMilestone = MILESTONES.find(m => m > currentStreak);

    return (
        <div className="rewards-page">
            <div className="rewards-header">
                <button className="auth-back-btn" onClick={onBack} aria-label="Go back"><ArrowLeft size={20} /></button>
                <h1>Your Rewards <Gift size={24} /></h1>
                <p>Complete workouts to unlock amazing coupons!</p>
            </div>

            <div className="rewards-stats">
                <div className="rewards-stat">
                    <span className="rewards-stat-val">{claimed.length}</span>
                    <span>Coupons Claimed</span>
                </div>
                <div className="rewards-stat">
                    <span className="rewards-stat-val">{unlockedCoupons.length}</span>
                    <span>Total Earned</span>
                </div>
                <div className="rewards-stat">
                    <span className="rewards-stat-val">{nextMilestone || 'MAX'}</span>
                    <span>Next Milestone</span>
                </div>
            </div>

            <div className="pill-tabs" style={{ marginBottom: '1.5rem' }}>
                {MILESTONES.map(m => (
                    <button
                        key={m}
                        className={`pill-tab ${activeMilestone === m ? 'active' : ''} ${currentStreak < m ? 'locked' : ''}`}
                        onClick={() => setActiveMilestone(m)}
                        disabled={currentStreak < m}
                    >
                        {m}d {currentStreak >= m ? '\u2713' : '\uD83D\uDD12'}
                    </button>
                ))}
            </div>

            {!isUnlocked ? (
                <div className="rewards-empty">
                    <span style={{ fontSize: '3rem' }}>&#128274;</span>
                    <h3>Keep going!</h3>
                    <p>Reach {activeMilestone} days to unlock {milestoneValues[activeMilestone]} in coupons</p>
                    <p style={{ color: 'var(--aqua)', fontWeight: 700 }}>{activeMilestone - currentStreak} days to go!</p>
                </div>
            ) : (
                <div className="rewards-grid">
                    {milestoneCoupons.map(coupon => (
                        <CouponCard key={coupon.id} coupon={coupon} claimed={claimed.includes(coupon.id)} onClaim={claimCoupon} onCopy={handleCopy} />
                    ))}
                </div>
            )}

            {toast && <div className="toast-notification"><Check size={16} /> {toast}</div>}
        </div>
    );
}
