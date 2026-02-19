import { Application, Graphics } from 'pixi.js';
import Fruit from './Fruit'; // Re-imported for force spawn debugging
import FruitSpawner from './FruitSpawner';
import SlashTrail from './SlashTrail';
import ParticleSystem from './ParticleSystem';
import { detectCollisions } from './CollisionDetector';
import {
    MAX_LIVES,
    POINTS_PER_FRUIT,
    COMBO_WINDOW_MS,
    SCREEN_SHAKE_DURATION,
    SCREEN_SHAKE_INTENSITY,
    CURSOR_COLOR,
    CURSOR_RADIUS,
} from './constants';

/**
 * Core game engine — manages PixiJS application, game loop, and all subsystems.
 */
export default class GameEngine {
    constructor() {
        this.app = null;
        this.spawner = null;
        this.slashTrail = null;
        this.particles = null;
        this.cursor = null;
        this.flashOverlay = null;

        // Game state
        this.score = 0;
        this.combo = 0;
        this.bestCombo = 0;
        this.lives = MAX_LIVES;
        this.lastSliceTime = 0;
        this.isRunning = false;

        // Screen shake
        this.shakeTime = 0;
        this.shakeStartTime = 0;

        // Callbacks
        this.onScoreUpdate = null;
        this.onGameOver = null;
        this.onComboUpdate = null;
        this.onLivesUpdate = null;

        // Finger tracking state
        this.fingerPos = null;
        this.prevFingerPos = null;
        this.frameCounter = 0;
        this.isPreview = false;

        // Screen dimensions
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    setPreview(enabled) {
        console.log('[GameEngine] setPreview:', enabled);
        this.isPreview = enabled;
    }

    /**
     * Initialize PixiJS and subsystems.
     * @param {HTMLElement} container - The DOM element to append the PixiJS canvas to.
     */
    async initialize(container) {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        console.log('[GameEngine] Initializing PixiJS with size:', this.width, 'x', this.height);

        this.app = new Application();

        await this.app.init({
            width: this.width,
            height: this.height,
            backgroundAlpha: 0,
            antialias: true,
            resolution: Math.min(window.devicePixelRatio, 2),
            autoDensity: true,
        });

        // Style the canvas PixiJS creates
        const canvas = this.app.canvas;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '10';
        canvas.style.pointerEvents = 'none';

        // Append to the container div
        container.appendChild(canvas);

        console.log('[GameEngine] Canvas appended to container');

        // Initialize subsystems
        this.slashTrail = new SlashTrail(this.app.stage);
        this.particles = new ParticleSystem(this.app.stage);
        this.spawner = new FruitSpawner(
            this.app.stage,
            this.width,
            this.height
        );

        // Cursor (purple circle)
        // Cursor (Arrow)
        this.cursor = new Graphics()
            .poly([
                0, 0,
                0, 24,
                6, 18,
                14, 28,
                18, 24,
                10, 14,
                20, 14,
                0, 0
            ])
            .fill({ color: CURSOR_COLOR })
            .stroke({ color: 0xffffff, width: 2 });

        // Pivot to tip
        this.cursor.pivot.set(0, 0); // Tip is at 0,0

        this.cursor.alpha = 0; // Hide initially until detection
        this.app.stage.addChild(this.cursor);

        // White flash overlay for bomb explosions (on top of everything)
        this.flashOverlay = new Graphics()
            .rect(0, 0, this.width, this.height)
            .fill({ color: 0xffffff });
        this.flashOverlay.alpha = 0;
        this.app.stage.addChild(this.flashOverlay);

        // Game loop
        this.app.ticker.add(this._gameLoop, this);

        // Handle resize
        this._onResize = () => this._handleResize();
        window.addEventListener('resize', this._onResize);

        console.log('[GameEngine] Initialization complete');
    }

    start() {
        this.score = 0;
        this.combo = 0;
        this.bestCombo = 0;
        this.lives = MAX_LIVES;
        this.isRunning = true;
        this.shakeTime = 0;

        this.spawner.clear();
        this.slashTrail.clear();
        this.particles.clear();

        this.onScoreUpdate?.(this.score);
        this.onLivesUpdate?.(this.lives);
        this.onComboUpdate?.(this.combo);

        console.log('[GameEngine] Game started');

        // Force spawn removed to prevent early fruits during countdown
    }

    _gameLoop() {
        if (!this.isRunning && !this.isPreview) return;

        try {
            const timestamp = performance.now();
            this.frameCounter++; // Increment frame counter

            const delta = this.app.ticker.deltaTime;

            if (true) { // Always run physics
                // Update spawner (physics + physics, spawning only if not preview)
                this.spawner.update(timestamp, delta, !this.isPreview);

                // Cleanup off-screen entities
                const missed = this.spawner.cleanup();

                // Only punish missed fruits if not in preview
                if (!this.isPreview && missed > 0) {
                    this.lives -= missed;
                    this.combo = 0;
                    this.onLivesUpdate?.(this.lives);
                    this.onComboUpdate?.(this.combo);

                    if (this.lives <= 0) {
                        this._triggerGameOver();
                    }
                }

                // Check collisions if slashing (and not preview)
                if (!this.isPreview && this.fingerPos && this.prevFingerPos) {
                    // ... collision logic omitted for brevity as it doesn't need delta change yet
                    // But we keep the block.
                    const pixelPos = {
                        x: this.fingerPos.x * this.width,
                        y: this.fingerPos.y * this.height,
                    };
                    const prevPixelPos = {
                        x: this.prevFingerPos.x * this.width,
                        y: this.prevFingerPos.y * this.height,
                    };

                    const hits = detectCollisions(prevPixelPos, pixelPos, this.spawner.entities);

                    for (const hit of hits) {
                        if (hit.isBomb) {
                            this._handleBombHit();
                            return;
                        }
                        this._handleFruitSlice(hit, pixelPos);
                    }
                }
            }

            // Update visuals
            this.slashTrail.update(delta);
            this.particles.update(delta);

            // Screen shake
            if (this.shakeTime > 0) {
                const elapsed = timestamp - this.shakeStartTime;
                if (elapsed < SCREEN_SHAKE_DURATION) {
                    const intensity = SCREEN_SHAKE_INTENSITY * (1 - elapsed / SCREEN_SHAKE_DURATION);
                    this.app.stage.x = (Math.random() - 0.5) * intensity * 2;
                    this.app.stage.y = (Math.random() - 0.5) * intensity * 2;
                } else {
                    this.app.stage.x = 0;
                    this.app.stage.y = 0;
                    this.shakeTime = 0;
                }
            }

            // Flash fade out
            if (this.flashOverlay.alpha > 0) {
                this.flashOverlay.alpha -= 0.05;
            }
        } catch (err) {
            console.error('[GameEngine] Game loop error:', err);
            this.isRunning = false;
        }
    }

    updateFingerPosition(normalizedPos, prevPos, isSlashing) {
        this.fingerPos = normalizedPos;
        this.prevFingerPos = prevPos;

        if (normalizedPos) {
            const px = normalizedPos.x * this.width;
            const py = normalizedPos.y * this.height;
            this.slashTrail.addPoint(px, py, isSlashing);

            // Update cursor
            if (this.cursor) {
                this.cursor.x = px;
                this.cursor.y = py;
                this.cursor.alpha = 1;
            }
        } else {
            if (this.cursor) this.cursor.alpha = 0;
        }
    }

    _handleFruitSlice(fruit, pixelPos) {
        fruit.slice();

        // Particles
        this.particles.emit(fruit.x, fruit.y, fruit.type.particleColor);

        // Score
        const now = performance.now();
        if (now - this.lastSliceTime < COMBO_WINDOW_MS) {
            this.combo++;
        } else {
            this.combo = 1;
        }
        this.lastSliceTime = now;

        if (this.combo > this.bestCombo) {
            this.bestCombo = this.combo;
        }

        const points = POINTS_PER_FRUIT * Math.max(1, this.combo);
        this.score += points;

        this.onScoreUpdate?.(this.score);
        this.onComboUpdate?.(this.combo);
    }

    _handleBombHit() {
        // Screen shake
        this.shakeTime = 1;
        this.shakeStartTime = performance.now();

        // White flash
        this.flashOverlay.alpha = 0.8;

        // Particles (fiery)
        if (this.fingerPos) {
            const px = this.fingerPos.x * this.width;
            const py = this.fingerPos.y * this.height;
            this.particles.emit(px, py, 0xe74c3c);
            this.particles.emit(px, py, 0xf39c12);
        }

        setTimeout(() => {
            this._triggerGameOver();
        }, 400);
    }

    _triggerGameOver() {
        this.isRunning = false;
        this.onGameOver?.({
            score: this.score,
            bestCombo: this.bestCombo,
        });
    }

    _handleResize() {
        if (!this.app) return;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.app.renderer.resize(this.width, this.height);
        this.spawner.resize(this.width, this.height);

        // Rebuild flash overlay
        this.flashOverlay.clear();
        this.flashOverlay
            .rect(0, 0, this.width, this.height)
            .fill({ color: 0xffffff });
        this.flashOverlay.alpha = 0;
    }

    destroy() {
        window.removeEventListener('resize', this._onResize);
        this.spawner?.destroy();
        this.slashTrail?.destroy();
        this.particles?.destroy();
        this.cursor?.destroy();
        if (this.app) {
            // Remove the canvas from the DOM
            const canvas = this.app.canvas;
            if (canvas?.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
            this.app.destroy(true);
        }
        this.app = null;
    }
}
