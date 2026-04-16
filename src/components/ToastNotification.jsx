import { X } from 'lucide-react';
import './ToastNotification.css';

export default function ToastNotification({ toasts, onDismiss }) {
    if (!toasts || toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="toast-notification"
                    role="alert"
                    aria-live="assertive"
                >
                    <div className="toast-icon">{toast.icon}</div>
                    <div className="toast-content">
                        <div className="toast-title">{toast.title}</div>
                        <div className="toast-message">{toast.message}</div>
                    </div>
                    <button
                        className="toast-dismiss"
                        onClick={() => onDismiss(toast.id)}
                        aria-label="Dismiss notification"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
}
