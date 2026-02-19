import { Graphics, Container } from 'pixi.js';
import { GRAVITY, FRUIT_TYPES, FRUIT_LAUNCH_VY_MIN, FRUIT_LAUNCH_VY_MAX } from './constants';

/**
 * A single fruit entity — drawn procedurally with PixiJS Graphics.
 */
export default class Fruit {
    constructor(stage, screenWidth, screenHeight) {
        this.stage = stage;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        // Pick a random fruit type
        const typeIndex = Math.floor(Math.random() * FRUIT_TYPES.length);
        this.type = FRUIT_TYPES[typeIndex];
        this.radius = this.type.radius;

        // Spawn position: valid range (15% to 85% of screen width)
        this.x = Math.random() * (screenWidth * 0.7) + screenWidth * 0.15;
        this.y = screenHeight + this.radius;

        // Launch velocity - Bias towards center
        const centerX = screenWidth * 0.5;
        const distFromCenter = (centerX - this.x) / (screenWidth * 0.5); // -1 (left) to 1 (right)

        // If at left (-1), want positive vx. If at right (1), want negative vx.
        this.vx = distFromCenter * 2 + (Math.random() - 0.5) * 1;

        // Vertical velocity from constants
        this.vy = FRUIT_LAUNCH_VY_MIN + Math.random() * (FRUIT_LAUNCH_VY_MAX - FRUIT_LAUNCH_VY_MIN);

        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.08;

        this.sliced = false;
        this.missed = false;

        // Container for the fruit
        this.container = new Container();
        this.container.x = this.x;
        this.container.y = this.y;
        this.stage.addChild(this.container);

        // Draw the fruit
        this._draw();

        // Halves (created on slice)
        this.halves = [];
    }

    _draw() {
        const gfx = new Graphics();

        // Outer circle (skin)
        gfx.circle(0, 0, this.radius).fill({ color: this.type.color });

        // Inner highlight
        gfx.circle(0, 0, this.radius * 0.55).fill({ color: this.type.innerColor, alpha: 0.5 });

        // Shine spot
        gfx
            .circle(-this.radius * 0.25, -this.radius * 0.3, this.radius * 0.2)
            .fill({ color: 0xffffff, alpha: 0.3 });

        this.gfx = gfx;
        this.container.addChild(gfx);
    }

    slice() {
        if (this.sliced) return; // Prevent double-slicing crash

        this.sliced = true;
        if (this.gfx) {
            this.container.removeChild(this.gfx);
            this.gfx.destroy();
            this.gfx = null;
        }

        // Create two halves that fly apart
        for (let side = -1; side <= 1; side += 2) {
            const half = new Graphics();

            // Draw a half-circle
            half.arc(0, 0, this.radius, -Math.PI / 2, Math.PI / 2).fill({ color: this.type.color });
            half.rect(-2, -this.radius, 4, this.radius * 2).fill({ color: this.type.innerColor });

            // Inner flesh
            half
                .arc(0, 0, this.radius * 0.7, -Math.PI / 2, Math.PI / 2)
                .fill({ color: this.type.innerColor, alpha: 0.7 });

            const halfContainer = new Container();
            halfContainer.addChild(half);
            halfContainer.x = this.x;
            halfContainer.y = this.y;
            halfContainer.rotation = this.rotation;
            this.stage.addChild(halfContainer);

            this.halves.push({
                container: halfContainer,
                vx: this.vx + side * (3 + Math.random() * 2),
                vy: this.vy - 2,
                rotation: this.rotationSpeed + side * 0.08,
                alpha: 1,
            });
        }
    }

    update(delta) {
        if (this.sliced) {
            this._updateHalves(delta);
            return;
        }

        this.vy += GRAVITY * delta;
        this.x += this.vx * delta;
        this.y += this.vy * delta;
        this.rotation += this.rotationSpeed * delta;

        this.container.x = this.x;
        this.container.y = this.y;
        this.container.rotation = this.rotation;

        // Check if fruit fell below screen
        if (this.y > this.screenHeight + this.radius * 2) {
            this.missed = true;
        }
    }

    // ... slice() omitted as it just creates objects ...

    _updateHalves(delta) {
        for (const h of this.halves) {
            h.vy += GRAVITY * delta;
            h.container.x += h.vx * delta;
            h.container.y += h.vy * delta;
            h.container.rotation += h.rotation * delta;
            h.alpha -= 0.008 * delta;
            h.container.alpha = Math.max(0, h.alpha);
        }
    }

    isOffScreen() {
        if (this.sliced) {
            return this.halves.every((h) => h.container.y > this.screenHeight + 100 || h.alpha <= 0);
        }
        return this.y > this.screenHeight + this.radius * 2;
    }

    destroy() {
        if (!this.sliced && this.gfx) {
            this.container.removeChild(this.gfx);
            this.gfx.destroy();
        }
        this.stage.removeChild(this.container);
        this.container.destroy();

        for (const h of this.halves) {
            this.stage.removeChild(h.container);
            h.container.destroy();
        }
        this.halves = [];
    }
}
