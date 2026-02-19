/**
 * Line-segment to circle collision detection.
 * Used to detect if the slash trail intersects with a fruit hitbox.
 */

/**
 * Tests if a line segment (p1 → p2) intersects a circle at (cx, cy) with radius r.
 * @returns {boolean}
 */
export function lineCircleIntersection(p1x, p1y, p2x, p2y, cx, cy, r) {
    // Vector from p1 to p2
    const dx = p2x - p1x;
    const dy = p2y - p1y;

    // Vector from p1 to circle center
    const fx = p1x - cx;
    const fy = p1y - cy;

    const a = dx * dx + dy * dy;

    // Zero-length line segment (points are the same)
    if (a < 0.000001) {
        return fx * fx + fy * fy <= r * r;
    }

    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - r * r;

    let discriminant = b * b - 4 * a * c;

    if (discriminant < 0) return false;

    discriminant = Math.sqrt(discriminant);

    // Check both intersection points
    const t1 = (-b - discriminant) / (2 * a);
    const t2 = (-b + discriminant) / (2 * a);

    // t must be in [0, 1] for the intersection to be on the line segment
    if ((t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)) {
        return true;
    }

    // Also check if segment is entirely inside the circle
    if (t1 < 0 && t2 > 1) {
        return true;
    }

    return false;
}

/**
 * Check which fruits are hit by the current slash.
 * @param {{ x: number, y: number }} prevPos - Previous finger position (pixels)
 * @param {{ x: number, y: number }} currPos - Current finger position (pixels)
 * @param {Array} fruits - Array of fruit objects with { x, y, radius, sliced }
 * @returns {Array} - Array of hit fruit objects
 */
export function detectCollisions(prevPos, currPos, fruits) {
    if (!prevPos || !currPos) return [];

    const hits = [];
    for (const fruit of fruits) {
        if (fruit.sliced || fruit.missed) continue;
        if (
            lineCircleIntersection(
                prevPos.x, prevPos.y,
                currPos.x, currPos.y,
                fruit.x, fruit.y,
                fruit.radius
            )
        ) {
            hits.push(fruit);
        }
    }
    return hits;
}
