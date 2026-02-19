// ─── NinjaVision Game Constants ───

export const GRAVITY = 0.15; // Very low gravity (underwater feel)
export const SPAWN_INTERVAL_MIN = 1200;   // ms
export const SPAWN_INTERVAL_MAX = 2500;  // ms
export const FRUIT_RADIUS = 40;
export const FRUIT_LAUNCH_VY_MIN = -9; // Very slow rise
export const FRUIT_LAUNCH_VY_MAX = -13;
export const FRUIT_LAUNCH_VX_RANGE = 1.5; // Very narrow random spread (we will override this with center logic)

export const SLASH_VELOCITY_THRESHOLD = 0.003; // Much easier to trigger
export const SLASH_TRAIL_LENGTH = 50; // Longer trail

export const CURSOR_COLOR = 0x9b59b6; // Purple
export const CURSOR_RADIUS = 0; // Not used for circle anymore, drawing custom arrow

export const MAX_LIVES = 3;
export const POINTS_PER_FRUIT = 10;
export const COMBO_WINDOW_MS = 500;
export const COMBO_MULTIPLIER_BASE = 1;

export const BOMB_CHANCE = 0.12; // 12% chance per spawn

export const PARTICLE_COUNT = 18;
export const PARTICLE_SPEED = 8;
export const PARTICLE_LIFETIME = 40; // frames
export const PARTICLE_GRAVITY = 0.3;

export const SCREEN_SHAKE_DURATION = 500; // ms
export const SCREEN_SHAKE_INTENSITY = 12;

// Fruit types with their colors
export const FRUIT_TYPES = [
  {
    name: 'watermelon',
    color: 0x2d7d3a,
    innerColor: 0xe74c3c,
    particleColor: 0xe74c3c,
    radius: 45,
  },
  {
    name: 'orange',
    color: 0xf39c12,
    innerColor: 0xf5b041,
    particleColor: 0xf39c12,
    radius: 38,
  },
  {
    name: 'coconut',
    color: 0x7b5b3a,
    innerColor: 0xfdfefe,
    particleColor: 0xfdfefe,
    radius: 36,
  },
  {
    name: 'mango',
    color: 0xf1c40f,
    innerColor: 0xf9e154,
    particleColor: 0xf1c40f,
    radius: 40,
  },
  {
    name: 'grape',
    color: 0x8e44ad,
    innerColor: 0xbb8fce,
    particleColor: 0x8e44ad,
    radius: 32,
  },
];

export const BOMB_COLOR = 0x1a1a2e;
export const BOMB_FUSE_COLOR = 0xf39c12;
export const BOMB_SPARK_COLOR = 0xe74c3c;
