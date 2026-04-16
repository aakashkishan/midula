import { useState } from 'react';
import { Copy, Check, ChevronDown } from 'lucide-react';

export default function CouponCard({ coupon, claimed, onClaim, onCopy }) {
    const [copied, setCopied] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const handleCopy = async () => {
        const ok = await onCopy(coupon.code);
        if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
    };

    return (
        <div className="coupon-card" style={{ borderTopColor: coupon.brandColor }}>
            <div className="coupon-header">
                <span className="coupon-brand-logo">{coupon.logo}</span>
                <div>
                    <span className="coupon-brand" style={{ color: coupon.brandColor }}>{coupon.brand}</span>
                    <span className="coupon-category">{coupon.category}</span>
                </div>
                {claimed && <span className="coupon-claimed-badge">Claimed &#10003;</span>}
            </div>
            <div className="coupon-body">
                <div className="coupon-discount" style={{ color: coupon.brandColor }}>{coupon.discount}</div>
                <div className="coupon-title">{coupon.title}</div>
                <div className="coupon-description">{coupon.description}</div>
            </div>
            <div className="coupon-code-wrap">
                <div className="coupon-code-box">
                    <code>{coupon.code}</code>
                    <button className="coupon-copy-btn" onClick={handleCopy} aria-label="Copy code">
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                </div>
                {!claimed && <button className="coupon-claim-btn" style={{ background: coupon.brandColor }} onClick={() => onClaim(coupon.id)}>Claim Offer</button>}
            </div>
            <div className="coupon-meta">
                <span>Min order: {coupon.minOrder}</span>
                <span>Valid till: {coupon.validUntil}</span>
            </div>
            <button className="coupon-terms-toggle" onClick={() => setExpanded(!expanded)}>
                Terms &amp; Conditions <ChevronDown size={14} style={{ transform: expanded ? 'rotate(180deg)' : '' }} />
            </button>
            {expanded && <div className="coupon-terms"><p>{coupon.terms}</p><p>Source: {coupon.source}</p></div>}
        </div>
    );
}
