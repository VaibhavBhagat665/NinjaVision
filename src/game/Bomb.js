import { Graphics, Container } from 'pixi.js';
import { GRAVITY, BOMB_COLOR, BOMB_FUSE_COLOR, BOMB_SPARK_COLOR } from './constants';

/**
 * A bomb entity — slashing it triggers game over.
 */
export default class Bomb {
    constructor(stage, screenWidth, screenHeight) {
        this.stage = stage;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.radius = 38;
        this.isBomb = true;

        // Spawn position
        this.x = Math.random() * (screenWidth * 0.7) + screenWidth * 0.15;
        this.y = screenHeight + this.radius;

        // Launch velocity
        const centerX = screenWidth * 0.5;
        const distFromCenter = (centerX - this.x) / (screenWidth * 0.5);
        this.vx = distFromCenter * 2 + (Math.random() - 0.5) * 1;

        this.vy = -(10 + Math.random() * 4); // Slightly slower than before
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.08;

        this.sliced = false;
        this.missed = false;

        // Container
        this.container = new Container();
        this.container.x = this.x;
        this.container.y = this.y;
        this.stage.addChild(this.container);

        this._draw();

        // Pulsing animation
        this.pulsePhase = 0;
    }

    _draw() {
        const gfx = new Graphics();

        // Bomb body
        gfx.circle(0, 0, this.radius).fill({ color: BOMB_COLOR });

        // Dark shading
        gfx.circle(0, 0, this.radius).fill({ color: 0x000000, alpha: 0.3 });
        gfx.circle(0, 0, this.radius * 0.9).fill({ color: BOMB_COLOR });

        // Skull/danger indicator — X mark
        const s = this.radius * 0.35;
        gfx
            .moveTo(-s, -s).lineTo(s, s)
            .stroke({ width: 4, color: 0xe74c3c, alpha: 0.8 });
        gfx
            .moveTo(s, -s).lineTo(-s, s)
            .stroke({ width: 4, color: 0xe74c3c, alpha: 0.8 });

        // Fuse
        gfx
            .moveTo(0, -this.radius * 0.85)
            .lineTo(5, -this.radius * 1.2)
            .lineTo(10, -this.radius * 1.35)
            .stroke({ width: 3, color: BOMB_FUSE_COLOR });

        // Spark at fuse tip
        gfx.circle(10, -this.radius * 1.35, 5).fill({ color: BOMB_SPARK_COLOR });
        gfx.circle(10, -this.radius * 1.35, 8).fill({ color: BOMB_SPARK_COLOR, alpha: 0.3 });

        // Shine
        gfx
            .circle(-this.radius * 0.3, -this.radius * 0.3, this.radius * 0.15)
            .fill({ color: 0x444466, alpha: 0.5 });

        this.gfx = gfx;
        this.container.addChild(gfx);
    }

    update(delta) {
        this.vy += GRAVITY * delta;
        this.x += this.vx * delta;
        this.y += this.vy * delta;
        this.rotation += this.rotationSpeed * delta;

        this.container.x = this.x;
        this.container.y = this.y;
        this.container.rotation = this.rotation;

        // Pulse effect
        this.pulsePhase += 0.1 * delta;
        const pulse = 1 + Math.sin(this.pulsePhase) * 0.05;
        this.container.scale.set(pulse);

        if (this.y > this.screenHeight + this.radius * 2) {
            this.missed = true;
        }
    }

    isOffScreen() {
        return this.y > this.screenHeight + this.radius * 2;
    }

    destroy() {
        this.stage.removeChild(this.container);
        this.container.destroy({ children: true });
    }
}
