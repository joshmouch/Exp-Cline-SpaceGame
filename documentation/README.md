# Kerbal-Cline Documentation

This folder contains technical documentation for the Kerbal-Cline 2D space flight simulator.

## Contents

### Overview
- [Project Summary](kerbal-cline-summary.md) - Comprehensive overview of the project

### System Architecture
- [System Architecture](system-architecture.md) - Core components and their relationships
- [Game Loop Sequence](game-loop-sequence.md) - Main game loop and execution sequence
- [Physics System](physics-system.md) - Gravity, trajectory, and collision systems
- [Rocket States](rocket-states.md) - State machine for rocket behavior
- [Camera System](camera-system.md) - Camera control and view management
- [Rendering Pipeline](rendering-pipeline.md) - Visualization system and effects

### Entity Models
- [Celestial Bodies](celestial-bodies.md) - Solar system objects and their properties
- [User Controls](user-controls.md) - Input handling and user interaction

### Development Notes
- [Bug Fixes](bug-fixes.md) - History of notable bug fixes and their solutions

### Visual References
- [Solar System Model](solar-system-model.svg) - Visualization of the solar system
- [Rocket Physics Diagram](rocket-physics-diagram.svg) - Forces and physics applied to the rocket
- [Game UI Layout](game-ui-layout.svg) - User interface components and layout

## Diagram Rendering

The documentation includes Mermaid diagrams (`.md` files) and SVG images (`.svg` files). 

- Mermaid diagrams can be viewed in any Markdown editor that supports Mermaid syntax (like Visual Studio Code with the Mermaid plugin, GitHub, or GitLab).
- SVG files can be opened directly in any modern web browser or vector graphics editor.

## Project Structure

The Kerbal-Cline project is organized as follows:

```
Kerbal-Cline/
├── index.html           # Main HTML entry point
├── style.css            # Global styles
├── js/                  # JavaScript source files
│   ├── main.js          # Application entry point and game loop
│   ├── constants.js     # Game constants and configuration
│   ├── physics.js       # Physics calculations
│   ├── camera.js        # Camera and view management
│   ├── controls.js      # User input handling
│   ├── rendering.js     # Rendering pipeline
│   ├── utils.js         # Utility functions
│   └── entities/        # Game entities
│       ├── rocket.js    # Player's spacecraft
│       ├── celestialBodies.js  # Generic celestial body functionality
│       ├── earth.js     # Earth-specific functionality
│       ├── moon.js      # Moon-specific functionality
│       ├── stars.js     # Background star field
│       ├── clouds.js    # Atmospheric effects
│       ├── orbits.js    # Orbital mechanics
│       └── waterTwinkles.js  # Ocean effects
└── documentation/       # Technical documentation (this directory)
```
