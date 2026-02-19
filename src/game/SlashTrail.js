import { Graphics } from 'pixi.js';
import { SLASH_TRAIL_LENGTH } from './constants';

/**
 * Renders a glowing, fading slash trail following the player's finger.
 */
export default class SlashTrail {
    constructor(stage) {
        this.stage = stage;
        this.points = [];
        this.graphics = new Graphics();
        this.stage.addChild(this.graphics);
    }

    /**
     * Add a point to the trail.
     * @param {number} x - pixel X
     * @param {number} y - pixel Y
     * @param {boolean} isSlashing - whether the finger is moving fast enough
     */
    addPoint(x, y, isSlashing) {
        this.isSlashing = isSlashing;
        if (isSlashing) {
            this.points.push({ x, y });
            if (this.points.length > SLASH_TRAIL_LENGTH) {
                this.points.shift();
            }
        }
    }

    update() {
        this.graphics.clear();

        // Shrink trail if not slashing (slower fade out)
        if (!this.isSlashing && this.points.length > 0) {
            // Remove 2 points per frame instead of 1 to make it "zip" away,
            // OR remove 1 point every 2 frames to make it linger.
            // Let's make it linger:
            // this.points.shift();

            // To make it smooth but not instant:
            this.points.shift();
            if (this.points.length > 0) this.points.shift();
        }

        if (this.points.length < 2) return;

        // Draw multiple passes for glow effect
        const passes = [
            { width: 30, color: 0x9b59b6, alphaMultiplier: 0.15 }, // outer glow (purple tint)
            { width: 20, color: 0x00ffff, alphaMultiplier: 0.3 },  // mid glow
            { width: 8, color: 0xffffff, alphaMultiplier: 1.0 },   // core (thicker)
        ];

        for (const pass of passes) {
            for (let i = 1; i < this.points.length; i++) {
                const prev = this.points[i - 1];
                const curr = this.points[i];
                const progress = i / this.points.length; // 0 (old) → 1 (new)
                const alpha = progress * pass.alphaMultiplier;

                this.graphics
                    .moveTo(prev.x, prev.y)
                    .lineTo(curr.x, curr.y)
                    .stroke({ width: pass.width * progress, color: pass.color, alpha });
            }
        }
    }

    clear() {
        this.points = [];
        this.graphics.clear();
    }

    destroy() {
        this.stage.removeChild(this.graphics);
        this.graphics.destroy();
    }
}
