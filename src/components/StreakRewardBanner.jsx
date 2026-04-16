import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { getCouponsForMilestone } from '../data/coupons';
import CouponRewardModal from './CouponRewardModal';
import { useCouponRewards } from '../hooks/useCouponRewards';
import './StreakRewardBanner.css';

const MILESTONES = [3, 7, 14, 30];

export default function StreakRewardBanner({ currentStreak, previousStreak }) {
    const [showBanner, setShowBanner] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [milestoneToShow, setMilestoneToShow] = useState(null);

    const { claimCoupon, copyCode, claimed } = useCouponRewards(milestoneToShow);

    useEffect(() => {
        if (!currentStreak || !previousStreak) return;

        const hitNewMilestone = MILESTONES.find(m => previousStreak < m && currentStreak >= m);

        if (hitNewMilestone) {
            setShowBanner(true);
            setShowConfetti(true);
            setMilestoneToShow(hitNewMilestone);

            // Confetti celebration
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.4 },
                colors: ['#8ec07c', '#fabd2f', '#d3869b', '#83a598', '#fe8019'],
            });

            // Auto-hide after 8 seconds
            const t = setTimeout(() => setShowBanner(false), 8000);
            return () => clearTimeout(t);
        }
    }, [currentStreak, previousStreak]);

    const handleOpenRewards = () => {
        setShowBanner(false);
        setShowModal(true);
    };

    if (!showBanner && !showModal) return null;

    const milestone = MILESTONES.find(m => previousStreak < m && currentStreak >= m);
    const couponCount = milestone ? getCouponsForMilestone(milestone).length : 0;

    return (
        <>
            {showConfetti && <div className="reward-confetti-burst" />}
            {showBanner && (
                <div className="streak-reward-banner">
                    <div className="reward-banner-content">
                        <span className="reward-emoji">&#127873;</span>
                        <div className="reward-text">
                            <h3>Milestone Unlocked! &#128293;</h3>
                            <p>{milestone}-day streak achieved!</p>
                            <span className="reward-teaser">
                                &#127881; {couponCount} exclusive coupons unlocked! Tap to claim your rewards...
                            </span>
                        </div>
                        <button className="reward-claim-now-btn" onClick={handleOpenRewards}>
                            View Rewards &#128073;
                        </button>
                    </div>
                    <button className="reward-dismiss" onClick={() => setShowBanner(false)}>
                        &#10005;
                    </button>
                </div>
            )}
            <CouponRewardModal
                milestone={milestoneToShow || milestone}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onClaim={claimCoupon}
                onCopy={copyCode}
                claimedCoupons={claimed}
            />
        </>
    );
}
