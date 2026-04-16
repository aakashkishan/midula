import { X, Bell, Clock, Calendar, RotateCcw, Check, AlertTriangle, History, Trash2 } from 'lucide-react';
import './NotificationSettings.css';

export default function NotificationSettings({
    isOpen,
    onClose,
    config,
    permission,
    history,
    onToggle,
    onSetTime,
    onSetFrequency,
    onRequestPermission,
    onClearHistory,
    onReset,
}) {
    if (!isOpen) return null;

    const notificationTypes = [
        {
            key: 'water_reminder',
            label: 'Water Reminder',
            description: 'Stay hydrated throughout the day',
            timeOptions: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
            frequencyOptions: ['once', '2h', '4h', '6h'],
        },
        {
            key: 'meal_reminder',
            label: 'Meal Reminder',
            description: 'Log your meals on time',
            timeOptions: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
            frequencyOptions: ['once', '2h', '4h', '6h'],
        },
        {
            key: 'workout_reminder',
            label: 'Workout Reminder',
            description: 'Time for your daily workout',
            timeOptions: ['05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '17:00', '18:00', '19:00', '20:00'],
            frequencyOptions: ['once', '2h', '4h', '6h'],
        },
        {
            key: 'recipe_recommendation',
            label: 'Recipe Recommendation',
            description: 'Discover new healthy recipes',
            timeOptions: ['08:00', '09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00', '18:00'],
            frequencyOptions: ['once', '2h', '4h', '6h'],
        },
        {
            key: 'stretch_reminder',
            label: 'Stretch Reminder',
            description: 'Take a break and stretch',
            timeOptions: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
            frequencyOptions: ['once', '2h', '4h', '6h'],
        },
    ];

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="notif-settings-overlay" onClick={handleBackdropClick}>
            <div className="notif-settings-panel" role="dialog" aria-modal="true" aria-label="Notification Settings">
                {/* Header */}
                <div className="notif-header">
                    <div className="notif-header-left">
                        <Bell size={20} strokeWidth={2} />
                        <h2>Notifications</h2>
                    </div>
                    <button className="notif-close-btn" onClick={onClose} aria-label="Close notification settings">
                        <X size={18} />
                    </button>
                </div>

                {/* Permission Banner */}
                {permission !== 'granted' && (
                    <div className="notif-permission-banner">
                        <AlertTriangle size={16} strokeWidth={2} />
                        <div className="notif-permission-text">
                            <span>Browser notifications are {permission === 'denied' ? 'blocked' : 'not enabled'}</span>
                            <button onClick={onRequestPermission} className="notif-permission-btn">
                                {permission === 'denied' ? 'Enable in Settings' : 'Enable Now'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Settings List */}
                <div className="notif-settings-list">
                    {notificationTypes.map((type) => {
                        const notifConfig = config[type.key] || {};
                        return (
                            <div key={type.key} className="notif-setting-item">
                                <div className="notif-setting-header">
                                    <div className="notif-setting-info">
                                        <h3>{type.label}</h3>
                                        <p>{type.description}</p>
                                    </div>
                                    <label className="notif-toggle">
                                        <input
                                            type="checkbox"
                                            checked={notifConfig.enabled || false}
                                            onChange={(e) => onToggle(type.key, e.target.checked)}
                                        />
                                        <span className="notif-toggle-slider"></span>
                                    </label>
                                </div>

                                {notifConfig.enabled && (
                                    <div className="notif-setting-options">
                                        <div className="notif-option-group">
                                            <label className="notif-option-label">
                                                <Clock size={13} strokeWidth={2} />
                                                Time
                                            </label>
                                            <select
                                                className="notif-select"
                                                value={notifConfig.time || '08:00'}
                                                onChange={(e) => onSetTime(type.key, e.target.value)}
                                            >
                                                {type.timeOptions.map(time => (
                                                    <option key={time} value={time}>{time}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="notif-option-group">
                                            <label className="notif-option-label">
                                                <Calendar size={13} strokeWidth={2} />
                                                Frequency
                                            </label>
                                            <select
                                                className="notif-select"
                                                value={notifConfig.frequency || 'once'}
                                                onChange={(e) => onSetFrequency(type.key, e.target.value)}
                                            >
                                                <option value="once">Once per day</option>
                                                <option value="2h">Every 2 hours</option>
                                                <option value="4h">Every 4 hours</option>
                                                <option value="6h">Every 6 hours</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* History Section */}
                {history.length > 0 && (
                    <div className="notif-history-section">
                        <div className="notif-history-header">
                            <div className="notif-history-header-left">
                                <History size={14} strokeWidth={2} />
                                <h3>Recent Notifications</h3>
                            </div>
                            <button className="notif-clear-history-btn" onClick={onClearHistory} aria-label="Clear notification history">
                                <Trash2 size={13} />
                            </button>
                        </div>
                        <div className="notif-history-list">
                            {history.map((item, i) => (
                                <div key={i} className="notif-history-item">
                                    <span className="notif-history-icon">{item.icon}</span>
                                    <div className="notif-history-content">
                                        <span className="notif-history-title">{item.title}</span>
                                        <span className="notif-history-message">{item.message}</span>
                                    </div>
                                    <span className="notif-history-time">
                                        {new Date(item.firedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reset Button */}
                <div className="notif-footer">
                    <button className="notif-reset-btn" onClick={onReset}>
                        <RotateCcw size={14} strokeWidth={2} />
                        Reset to Defaults
                    </button>
                </div>
            </div>
        </div>
    );
}
