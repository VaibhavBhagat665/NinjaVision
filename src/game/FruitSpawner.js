import Fruit from './Fruit';
import Bomb from './Bomb';
import { BOMB_CHANCE, SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_MAX } from './constants';

/**
 * Manages spawning of fruits and bombs at random intervals.
 */
export default class FruitSpawner {
    constructor(stage, screenWidth, screenHeight) {
        this.stage = stage;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.entities = [];
        this.lastSpawnTime = 0;
        this.nextSpawnDelay = this._randomDelay();
        this.difficulty = 1; // increases over time
    }

    _randomDelay() {
        const min = Math.max(500, SPAWN_INTERVAL_MIN - this.difficulty * 20);
        const max = Math.max(1000, SPAWN_INTERVAL_MAX - this.difficulty * 40);
        return min + Math.random() * (max - min);
    }

    update(timestamp, delta, enableSpawning = true) {
        const elapsed = timestamp - this.lastSpawnTime;

        if (enableSpawning && elapsed > this.nextSpawnDelay) {
            // console.log('[FruitSpawner] Spawning! Elapsed:', elapsed, 'Delay:', this.nextSpawnDelay);
            this._spawn();
            this.lastSpawnTime = timestamp;
            this.nextSpawnDelay = this._randomDelay();
        }

        // Update all entities
        for (const entity of this.entities) {
            entity.update(delta);
        }

        // Increase difficulty over time (slower increase)
        if (enableSpawning) {
            this.difficulty += 0.0005 * delta;
        }
    }

    _spawn() {
        // console.log('[FruitSpawner] Spawning fruit!');
        // Sometimes spawn multiple fruits at once (reduced chance)
        const count = Math.random() < 0.15 ? 2 : 1;

        for (let i = 0; i < count; i++) {
            if (Math.random() < BOMB_CHANCE) {
                this.entities.push(new Bomb(this.stage, this.screenWidth, this.screenHeight));
            } else {
                this.entities.push(new Fruit(this.stage, this.screenWidth, this.screenHeight));
            }
        }
    }

    /**
     * Remove off-screen and sliced entities. Returns missed count.
     */
    cleanup() {
        let missedCount = 0;

        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];

            if (entity.missed && !entity.isBomb) {
                missedCount++;
                entity.destroy();
                this.entities.splice(i, 1);
            } else if (entity.isOffScreen() && entity.sliced) {
                entity.destroy();
                this.entities.splice(i, 1);
            } else if (entity.isOffScreen() && entity.isBomb) {
                entity.destroy();
                this.entities.splice(i, 1);
            }
        }

        return missedCount;
    }

    getActiveEntities() {
        return this.entities.filter((e) => !e.sliced && !e.missed);
    }

    clear() {
        for (const entity of this.entities) {
            entity.destroy();
        }
        this.entities = [];
        this.difficulty = 1;
        this.lastSpawnTime = 0;
        this.nextSpawnDelay = this._randomDelay();
    }

    resize(width, height) {
        this.screenWidth = width;
        this.screenHeight = height;
    }

    destroy() {
        this.clear();
    }
}
