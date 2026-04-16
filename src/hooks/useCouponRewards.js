import { useState, useEffect, useCallback } from 'react';
import { getCouponsForMilestone } from '../data/coupons';

const STORAGE_KEY = 'midula_coupons';

function loadCoupons() {
    try {
        const d = localStorage.getItem(STORAGE_KEY);
        return d ? JSON.parse(d) : { unlocked: [], claimed: [] };
    } catch { return { unlocked: [], claimed: [] }; }
}

function saveCoupons(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function useCouponRewards(streakMilestone) {
    const [state, setState] = useState(loadCoupons);

    // Auto-unlock when milestone is reached
    useEffect(() => {
        if (!streakMilestone) return;
        const coupons = getCouponsForMilestone(streakMilestone);
        setState(prev => {
            const newUnlocked = [...prev.unlocked];
            coupons.forEach(c => {
                if (!newUnlocked.includes(c.id)) newUnlocked.push(c.id);
            });
            const updated = { ...prev, unlocked: newUnlocked };
            saveCoupons(updated);
            return updated;
        });
    }, [streakMilestone]);

    const claimCoupon = useCallback((couponId) => {
        setState(prev => {
            if (prev.claimed.includes(couponId)) return prev;
            const updated = { ...prev, claimed: [...prev.claimed, couponId] };
            saveCoupons(updated);
            return updated;
        });
    }, []);

    const copyCode = useCallback(async (code) => {
        try {
            await navigator.clipboard.writeText(code);
            return true;
        } catch { return false; }
    }, []);

    const getUnclaimedForMilestone = useCallback((milestone) => {
        const coupons = getCouponsForMilestone(milestone);
        return coupons.filter(c => !state.claimed.includes(c.id));
    }, [state.claimed]);

    const getUnlockedCoupons = useCallback(() => {
        const allCoupons = [];
        [3, 7, 14, 30].forEach(m => {
            getCouponsForMilestone(m).forEach(c => {
                if (state.unlocked.includes(c.id)) allCoupons.push({ ...c, milestone: m });
            });
        });
        return allCoupons;
    }, [state.unlocked]);

    const totalSavings = useCallback(() => {
        return state.claimed.length;
    }, [state.claimed]);

    return {
        unlocked: state.unlocked,
        claimed: state.claimed,
        claimCoupon,
        copyCode,
        getUnclaimedForMilestone,
        getUnlockedCoupons,
        totalSavings,
    };
}
