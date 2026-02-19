import React from 'react';
import './StartScreen.css';

export default function StartScreen({ onStart }) {
    return (
        <div className="start-screen">
            <div className="start-bg-orbs">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
            </div>

            <div className="start-content">
                <div className="logo-container">
                    <h1 className="game-title">
                        <span className="title-ninja">NINJA</span>
                        <span className="title-vision">VISION</span>
                    </h1>
                    <div className="title-slash" />
                    <p className="game-subtitle">Slice fruits with your bare hands</p>
                </div>

                <div className="start-instructions">
                    <div className="instruction-item">
                        <span className="instruction-icon">📷</span>
                        <span>Allow camera access</span>
                    </div>
                    <div className="instruction-item">
                        <span className="instruction-icon">☝️</span>
                        <span>Point your index finger</span>
                    </div>
                    <div className="instruction-item">
                        <span className="instruction-icon">⚡</span>
                        <span>Swipe through fruits to slice!</span>
                    </div>
                </div>

                <button className="start-button" onClick={onStart} id="start-btn">
                    <span className="btn-text">START GAME</span>
                    <span className="btn-glow" />
                </button>

                <div className="start-warning">
                    <span>💣 Avoid the bombs!</span>
                </div>
            </div>
        </div>
    );
}
