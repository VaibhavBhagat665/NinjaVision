import React from 'react';
import './HUD.css';

export default function HUD({ score, combo, lives, maxLives }) {
    return (
        <div className="hud">
            <div className="hud-left">
                <div className="hud-score">
                    <span className="hud-label">SCORE</span>
                    <span className="hud-value" key={score}>{score}</span>
                </div>
            </div>

            <div className="hud-center">
                {combo > 1 && (
                    <div className="hud-combo" key={combo}>
                        <span className="combo-text">x{combo} COMBO!</span>
                    </div>
                )}
            </div>

            <div className="hud-right">
                <div className="hud-lives">
                    {Array.from({ length: maxLives }, (_, i) => (
                        <span
                            key={i}
                            className={`life-icon ${i < lives ? 'active' : 'lost'}`}
                        >
                            {i < lives ? '❤️' : '🖤'}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
