```mermaid
classDiagram
    class CelestialBody {
        +name: string
        +radius: number
        +gravity: number
        +position: {x, y}
        +color: string
        +orbits: string
        +orbitRadius: number
        +orbitSpeed: number
        +orbitPhase: number
    }
    
    class Earth {
        +name: "earth"
        +radius: 150
        +gravity: 1.0
        +color: "#3498db"
        +orbits: "SUN"
    }
    
    class Moon {
        +name: "moon"
        +radius: 40
        +gravity: 1
        +color: "#bdc3c7"
        +orbits: "EARTH"
    }
    
    class Sun {
        +name: "sun"
        +radius: 200
        +gravity: 1
        +color: "#f39c12"
        +orbits: null
    }
    
    class Planet {
        +drawPlanet()
        +createAtmosphere()
        +createPlanetShading()
    }
    
    class OrbitSystem {
        +updateOrbits()
        +drawOrbitalPaths()
        +drawOrbitPath()
        +trackOrbit()
    }
    
    class VisualEffects {
        +drawSurface()
        +createAtmosphere()
        +drawCloudLayer()
        +drawOceanEffects()
    }
    
    CelestialBody <|-- Earth
    CelestialBody <|-- Moon
    CelestialBody <|-- Sun
    CelestialBody <|-- Mars
    CelestialBody <|-- Venus
    CelestialBody <|-- Jupiter
    
    CelestialBody "1" -- "1" Planet: renders
    CelestialBody "many" -- "1" OrbitSystem: manages
    Planet "1" -- "many" VisualEffects: uses
    
    class Mars {
        +name: "mars"
        +radius: 35
        +gravity: 1
        +color: "#e74c3c"
        +orbits: "SUN"
    }
    
    class Venus {
        +name: "venus"
        +radius: 40
        +gravity: 1
        +color: "#e67e22"
        +orbits: "SUN"
    }
    
    class Jupiter {
        +name: "jupiter"
        +radius: 150
        +gravity: 1
        +color: "#f1c40f"
        +orbits: "SUN"
    }
```