import { Graphics } from 'pixi.js';
import { PARTICLE_COUNT, PARTICLE_SPEED, PARTICLE_LIFETIME, PARTICLE_GRAVITY } from './constants';

/**
 * Manages juice particles that burst when a fruit is sliced.
 */
export default class ParticleSystem {
    constructor(stage) {
        this.stage = stage;
        this.particles = [];
    }

    /**
     * Emit a burst of particles at position (x, y) with the given color.
     */
    emit(x, y, color) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = PARTICLE_SPEED * (0.4 + Math.random() * 0.6);
            const size = 3 + Math.random() * 5;

            const gfx = new Graphics()
                .circle(0, 0, size)
                .fill({ color });

            gfx.x = x;
            gfx.y = y;
            gfx.alpha = 1;

            this.stage.addChild(gfx);

            this.particles.push({
                gfx,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 3, // slight upward bias
                life: PARTICLE_LIFETIME,
                maxLife: PARTICLE_LIFETIME,
            });
        }
    }

    update(delta) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.vx *= Math.pow(0.98, delta); // friction adjusted for delta
            p.vy += PARTICLE_GRAVITY * delta;
            p.gfx.x += p.vx * delta;
            p.gfx.y += p.vy * delta;
            p.life -= delta;
            p.gfx.alpha = Math.max(0, p.life / p.maxLife);
            p.gfx.scale.set(p.life / p.maxLife);

            if (p.life <= 0) {
                this.stage.removeChild(p.gfx);
                p.gfx.destroy();
                this.particles.splice(i, 1);
            }
        }
    }

    clear() {
        for (const p of this.particles) {
            this.stage.removeChild(p.gfx);
            p.gfx.destroy();
        }
        this.particles = [];
    }

    destroy() {
        this.clear();
    }
}
