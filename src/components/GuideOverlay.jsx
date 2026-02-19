import React, { useEffect, useState } from 'react';
import './GuideOverlay.css';

export default function GuideOverlay({ onComplete }) {
    const [timeLeft, setTimeLeft] = useState(3);
    const [isCounting, setIsCounting] = useState(false);
    const [showGo, setShowGo] = useState(false);

    useEffect(() => {
        if (!isCounting) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setShowGo(true);
                    setTimeout(onComplete, 800); // Wait a bit on "GO!"
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isCounting, onComplete]);

    return (
        <div className="guide-overlay">
            <div className="guide-content">
                {!showGo ? (
                    <>
                        {!isCounting ? (
                            <>
                                <h2 className="guide-title">How to Play</h2>
                                <div className="guide-steps">
                                    <div className="step">
                                        <span className="icon">☝️</span>
                                        <p>Use your <strong>Index Finger</strong></p>
                                    </div>
                                    <div className="step">
                                        <span className="icon">📷</span>
                                        <p>Stand back & keep hand visible</p>
                                    </div>
                                </div>

                                <button className="ready-btn" onClick={() => setIsCounting(true)}>
                                    I'M READY!
                                </button>
                            </>
                        ) : (
                            <div className="countdown-circle">
                                <svg viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" className="countdown-bg" />
                                    <circle cx="50" cy="50" r="45" className="countdown-progress" />
                                </svg>
                                <span className="countdown-text">{timeLeft}</span>
                            </div>
                        )}
                    </>
                ) : (
                    <h1 className="go-text">GO!</h1>
                )}
            </div>
        </div>
    );
}
