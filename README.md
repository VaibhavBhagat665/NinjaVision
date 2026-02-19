# 🍉 Fruit Ninja Vision

A gesture-controlled, AI-powered fruit slicing game built with React, PixiJS, and MediaPipe. Slice fruits in the air using your index finger!

## 🎮 Features

-   **AI Hand Tracking**: Uses Google MediaPipe to track your index finger in real-time via webcam.
-   **Gesture Control**: Slice fruits by moving your finger across the screen.
-   **Dynamic Physics**: Fruits float with underwater-like gravity for a "Zen" experience.
-   **Smart Tracking**:
    -   **Sticky Detection**: Locks onto your hand to prevent jitter.
    -   **Dynamic Smoothing**: Instantly reacts to fast slashes while smoothing slow movements.
-   **Visuals**:
    -   Custom Arrow Cursor.
    -   Particle effects and slash trails.
    -   Glass-morphism UI.

## 🚀 Getting Started

### Prerequisites

-   Node.js (v16 or higher)
-   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/fruit-ninja-vision.git
    cd fruit-ninja-vision
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser at `http://localhost:5173`.
5.  Allow camera access when prompted.

## 🕹️ Controls

-   **Start**: Stand back so your hand is visible. Click "I'M READY!" to begin.
-   **Play**: Use your **Index Finger** as a sword. Slice fruits to earn points.
-   **Avoid**: Do not slice the bombs! 💣
-   **Combo**: Slice multiple fruits in one stroke for combo points.

## 🛠️ Tech Stack

-   **Frontend**: React, Vite
-   **Game Engine**: PixiJS
-   **AI/ML**: MediaPipe Tasks Vision (Hand Landmarker)
-   **Styling**: CSS3, Glass-morphism effects

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements.

## 📄 License

This project is open-source and available under the MIT License.
