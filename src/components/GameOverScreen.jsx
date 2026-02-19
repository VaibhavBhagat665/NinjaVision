import React from 'react';
import './GameOverScreen.css';

export default function GameOverScreen({ score, bestCombo, onRestart }) {
    return (
        <div className="gameover-screen">
            <div className="gameover-content">
                <div className="gameover-icon">💥</div>
                <h1 className="gameover-title">GAME OVER</h1>

                <div className="gameover-stats">
                    <div className="stat-card">
                        <span className="stat-label">SCORE</span>
                        <span className="stat-value">{score}</span>
                    </div>
                    <div className="stat-card accent">
                        <span className="stat-label">BEST COMBO</span>
                        <span className="stat-value">x{bestCombo}</span>
                    </div>
                </div>

                <button className="restart-button" onClick={onRestart} id="restart-btn">
                    <span>PLAY AGAIN</span>
                </button>
            </div>
        </div>
    );
}
