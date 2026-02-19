import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { SLASH_VELOCITY_THRESHOLD } from '../game/constants';

export default class HandTracker {
    constructor() {
        this.handLandmarker = null;
        this.lastPosition = null;
        this.lastTimestamp = 0;
        this.isSlashing = false;
        this.velocity = 0;
        this.currentPosition = null;
        this.ready = false;
    }

    async initialize() {
        const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath:
                    'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numHands: 1,
            minHandDetectionConfidence: 0.1, // Lowered for better edge/fast detection
            minTrackingConfidence: 0.1,
        });

        this.ready = true;
    }

    /**
     * Process a single video frame. Returns tracking data.
     * @param {HTMLVideoElement} video
     * @param {number} timestamp - performance.now() value
     * @returns {{ position: {x: number, y: number} | null, velocity: number, isSlashing: boolean }}
     */
    processFrame(video, timestamp) {
        if (!this.ready || !this.handLandmarker) {
            return { position: null, velocity: 0, isSlashing: false };
        }

        // MediaPipe needs strictly increasing timestamps
        if (timestamp <= this.lastTimestamp) {
            timestamp = this.lastTimestamp + 1;
        }

        let results;
        try {
            results = this.handLandmarker.detectForVideo(video, timestamp);
        } catch {
            return { position: null, velocity: 0, isSlashing: false };
        }

        if (!results.landmarks || results.landmarks.length === 0) {
            this.lastPosition = null;
            this.currentPosition = null;
            this.smoothedPosition = null;
            this.isSlashing = false;
            this.velocity = 0;
            return { position: null, velocity: 0, isSlashing: false };
        }

        // Stickyness logic: Find the hand closest to the last known position
        let bestLandmarks = results.landmarks[0]; // Default to first hand
        let minDist = Infinity;

        if (this.lastPosition && results.landmarks.length > 1) {
            for (const landmarks of results.landmarks) {
                const lm = landmarks[8];
                const x = 1 - lm.x;
                const y = lm.y;
                const dx = x - this.lastPosition.x;
                const dy = y - this.lastPosition.y;
                const dist = dx * dx + dy * dy;

                if (dist < minDist) {
                    minDist = dist;
                    bestLandmarks = landmarks;
                }
            }
        }

        // Landmark 8 = Index finger tip (normalized 0..1)
        const landmark = bestLandmarks[8];
        // Mirror the X coordinate since we mirror the video
        const rawPos = { x: 1 - landmark.x, y: landmark.y };

        // Dynamic Smoothing (LERP)
        // Adjust alpha based on speed:
        // - Fast movement: High alpha (0.8-0.9) to reduce lag
        // - Slow movement: Low alpha (0.2-0.3) to reduce jitter and "float"
        let alpha = 0.5; // Base value
        if (this.lastPosition) {
            const dx = rawPos.x - this.lastPosition.x;
            const dy = rawPos.y - this.lastPosition.y;
            // Rough instantaneous velocity squared
            const distSq = dx * dx + dy * dy;

            // If dragging fast (e.g. > 2-3% of screen per frame), snap quickly
            if (distSq > 0.001) {
                alpha = 0.85;
            } else if (distSq < 0.0001) {
                // Verified still? Very Stable.
                alpha = 0.2;
            } else {
                // Moderate
                alpha = 0.5;
            }
        } else {
            alpha = 1.0; // First frame, snap instantly
        }

        if (!this.smoothedPosition) {
            this.smoothedPosition = rawPos;
        } else {
            this.smoothedPosition = {
                x: this.smoothedPosition.x + (rawPos.x - this.smoothedPosition.x) * alpha,
                y: this.smoothedPosition.y + (rawPos.y - this.smoothedPosition.y) * alpha,
            };
        }

        const pos = this.smoothedPosition;
        this.currentPosition = pos;

        if (this.lastPosition) {
            const dx = pos.x - this.lastPosition.x;
            const dy = pos.y - this.lastPosition.y;
            const dt = (timestamp - this.lastTimestamp) || 1;
            this.velocity = Math.sqrt(dx * dx + dy * dy) / (dt / 16.67); // normalize to ~60fps
            this.isSlashing = this.velocity > SLASH_VELOCITY_THRESHOLD;
        }

        const result = {
            position: pos,
            previousPosition: this.lastPosition ? { ...this.lastPosition } : null,
            velocity: this.velocity,
            isSlashing: this.isSlashing,
        };

        this.lastPosition = { ...pos };
        this.lastTimestamp = timestamp;

        return result;
    }

    destroy() {
        if (this.handLandmarker) {
            this.handLandmarker.close();
            this.handLandmarker = null;
        }
        this.ready = false;
    }
}
