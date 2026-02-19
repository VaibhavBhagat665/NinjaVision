import React, { useRef, useEffect, useState, useCallback } from 'react';
import GameEngine from './game/GameEngine';
import HandTracker from './ml/HandTracker';
import { MAX_LIVES } from './game/constants';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import GuideOverlay from './components/GuideOverlay';
import HUD from './components/HUD';
import './App.css';

// Game states
const STATE = {
  MENU: 'MENU',
  LOADING: 'LOADING',
  GUIDE: 'GUIDE',
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER',
};

const FUNNY_MESSAGES = [
  "Summoning the fruit ninja spirit...",
  "Sharpening pixels...",
  "Teaching watermelons to fly...",
  "Hiring stunt fruits...",
  "Cleaning up fruit juice...",
  "Calibrating banana curvature...",
  "Loading vitamin C...",
];

const getRandomMessage = () => FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)];

console.log('[App] Module loaded');

export default function App() {
  console.log('[App] Component rendering');
  const videoRef = useRef(null);
  const gameContainerRef = useRef(null);
  const gameEngineRef = useRef(null);
  const handTrackerRef = useRef(null);
  const animFrameRef = useRef(null);

  const [gameState, setGameState] = useState(STATE.MENU);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [finalStats, setFinalStats] = useState({ score: 0, bestCombo: 0 });
  const [loadingText, setLoadingText] = useState('');

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      return true;
    } catch (err) {
      console.error('Camera access denied:', err);
      setLoadingText('Camera access denied. Please allow camera permissions and reload.');
      return false;
    }
  }, []);

  // Start the hand-tracking → game loop
  const startTrackingLoop = useCallback(() => {
    const trackLoop = () => {
      const video = videoRef.current;
      const tracker = handTrackerRef.current;
      const engine = gameEngineRef.current;

      if (!video || !tracker || !engine) return;

      if (video.readyState >= 2) {
        const timestamp = performance.now();
        const result = tracker.processFrame(video, timestamp);

        if (result.position) {
          engine.updateFingerPosition(
            result.position,
            result.previousPosition,
            result.isSlashing
          );
        }
      }
      animFrameRef.current = requestAnimationFrame(trackLoop);
    };
    trackLoop();
  }, []);

  // Initialize game engine + hand tracker
  const initializeGame = useCallback(async () => {
    setGameState(STATE.LOADING);
    setLoadingText('Requesting camera access...');

    const cameraOk = await startCamera();
    if (!cameraOk) return;

    setLoadingText(getRandomMessage());

    // Initialize hand tracker
    try {
      const tracker = new HandTracker();
      await tracker.initialize();
      handTrackerRef.current = tracker;
    } catch (err) {
      console.error('Hand tracker init failed:', err);
      setLoadingText('Failed to load hand tracking. Please try a different browser.');
      return;
    }

    setLoadingText(getRandomMessage());

    // Initialize game engine — pass the container div
    try {
      const engine = new GameEngine();
      await engine.initialize(gameContainerRef.current);

      engine.onScoreUpdate = (s) => setScore(s);
      engine.onComboUpdate = (c) => setCombo(c);
      engine.onLivesUpdate = (l) => setLives(l);
      engine.onGameOver = (stats) => {
        setFinalStats(stats);
        setGameState(STATE.GAME_OVER);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };

      gameEngineRef.current = engine;

      // Enable preview mode so trails work but game doesn't start
      engine.setPreview(true);
      engine.start();

      // Start tracking loop immediately
      startTrackingLoop();

      setGameState(STATE.GUIDE);

    } catch (err) {
      console.error('Game engine init failed:', err);
      setLoadingText('Failed to initialize game. Please reload and try again.');
    }
  }, [startCamera, startTrackingLoop]);

  // Transition from Guide -> Playing
  const handleGuideComplete = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.setPreview(false);
      gameEngineRef.current.start(); // Resets score etc.
      setGameState(STATE.PLAYING);
    }
  }, []);

  // Restart handler
  const handleRestart = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.start();
      setScore(0);
      setCombo(0);
      setLives(MAX_LIVES);
      setGameState(STATE.PLAYING);
      startTrackingLoop();
    }
  }, [startTrackingLoop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      handTrackerRef.current?.destroy();
      gameEngineRef.current?.destroy();
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div className={`app ${gameState !== STATE.PLAYING ? 'cursor-visible' : ''}`}>
      {/* Webcam video (always rendered, hidden when in menu) */}
      <video
        ref={videoRef}
        className={`webcam-feed ${gameState !== STATE.MENU ? 'visible' : ''}`}
        playsInline
        muted
      />

      {/* Dark overlay on video for contrast */}
      {gameState === STATE.PLAYING && <div className="video-overlay" />}

      {/* Container for PixiJS canvas (PixiJS creates + appends its own canvas here) */}
      <div ref={gameContainerRef} className="game-container" />

      {/* UI overlays */}
      {gameState === STATE.MENU && <StartScreen onStart={initializeGame} />}

      {gameState === STATE.LOADING && (
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p className="loading-text">{loadingText}</p>
        </div>
      )}

      {gameState === STATE.GUIDE && (
        <GuideOverlay onComplete={handleGuideComplete} />
      )}

      {(gameState === STATE.PLAYING || gameState === STATE.GAME_OVER) && (
        <HUD score={score} combo={combo} lives={lives} maxLives={MAX_LIVES} />
      )}

      {gameState === STATE.GAME_OVER && (
        <GameOverScreen
          score={finalStats.score}
          bestCombo={finalStats.bestCombo}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
