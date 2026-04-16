import { useEffect, useState } from 'react';
import { X, Gift, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCouponsForMilestone, milestoneValues } from '../data/coupons';
import CouponCard from './CouponCard';
import confetti from 'canvas-confetti';

export default function CouponRewardModal({ milestone, isOpen, onClose, onClaim, onCopy, claimedCoupons }) {
    const [page, setPage] = useState(0);
    const coupons = getCouponsForMilestone(milestone);
    const perPage = 2;
    const totalPages = Math.ceil(coupons.length / perPage);
    const visible = coupons.slice(page * perPage, (page + 1) * perPage);

    useEffect(() => {
        if (isOpen && milestone) {
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.4 }, colors: ['#8ec07c', '#fabd2f', '#d3869b', '#83a598', '#fe8019'] });
            setPage(0);
        }
    }, [isOpen, milestone]);

    if (!isOpen || !milestone) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content coupon-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}><X size={20} /></button>
                <div className="coupon-modal-header">
                    <Gift size={32} />
                    <h2>Rewards Unlocked! &#127881;</h2>
                    <p>{milestone}-day streak earned you coupons worth {milestoneValues[milestone]}</p>
                </div>
                <div className="coupon-carousel">
                    {visible.map(coupon => (
                        <CouponCard key={coupon.id} coupon={coupon} claimed={claimedCoupons.includes(coupon.id)} onClaim={onClaim} onCopy={onCopy} />
                    ))}
                </div>
                {totalPages > 1 && (
                    <div className="coupon-carousel-nav">
                        <button disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft size={20} /></button>
                        <div className="coupon-dots">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <div key={i} className={`coupon-dot ${i === page ? 'active' : ''}`} />
                            ))}
                        </div>
                        <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}><ChevronRight size={20} /></button>
                    </div>
                )}
                <button className="modal-btn-primary" onClick={onClose}>Got it!</button>
            </div>
        </div>
    );
}
