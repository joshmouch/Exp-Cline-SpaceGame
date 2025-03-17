```mermaid
graph TD
    HTML[index.html] --> Main[main.js]
    
    subgraph Core Components
        Main --> |initializes| State[Game State]
        Main --> |controls| GameLoop[Game Loop]
        GameLoop --> Update[update()]
        GameLoop --> Render[render()]
    end
    
    subgraph Physics Engine
        Physics[physics.js] --> Gravity[Gravity System]
        Physics --> Trajectory[Trajectory Calculation]
        Physics --> Orbits[Orbital Mechanics]
        Physics --> Collision[Collision Detection]
    end
    
    subgraph User Interface
        Controls[controls.js] --> KeyboardInput[Keyboard Input]
        Controls --> ButtonInput[Button Input]
        Controls --> MouseInput[Mouse Input]
        Controls --> UI[UI Updates]
    end
    
    subgraph Rendering System
        Rendering[rendering.js] --> Scene[Scene Rendering]
        Rendering --> Camera[Camera System]
        Rendering --> Effects[Visual Effects]
    end
    
    subgraph Game Entities
        Rocket[rocket.js] --> RocketPhysics[Rocket Physics]
        Rocket --> RocketVisuals[Rocket Visuals]
        CelestialBodies[celestialBodies.js] --> Planets[Planets Rendering]
        CelestialBodies --> Sun[Sun Rendering]
        Earth[earth.js] --> EarthVisuals[Earth Visuals]
        Moon[moon.js] --> MoonVisuals[Moon Visuals]
        Stars[stars.js] --> StarField[Star Field]
        Clouds[clouds.js] --> AtmosphericEffects[Atmospheric Effects]
        WaterTwinkles[waterTwinkles.js] --> OceanEffects[Ocean Effects]
        Orbits[orbits.js] --> OrbitalPaths[Orbital Paths]
    end
    
    Update --> Physics
    Update --> Controls
    Update --> |updates| Entities[Game Entities]
    
    Render --> Rendering
    Rendering --> |renders| Entities
    
    Entities --> Rocket
    Entities --> CelestialBodies
    Entities --> Earth
    Entities --> Moon
    Entities --> Stars
    Entities --> Clouds
    Entities --> WaterTwinkles
    Entities --> Orbits
```