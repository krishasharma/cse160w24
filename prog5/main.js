
import * as THREE from 'https://unpkg.com/three@0.125.2/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.125.2/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://unpkg.com/three@0.125.2/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.125.2/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.125.2/examples/jsm/postprocessing/UnrealBloomPass.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Black for space

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(20, 15, -25);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Bloom effect setup
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0;
bloomPass.strength = 1.5; // lower this if the scene is too bright or increase it if too dark
bloomPass.radius = 0;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Lighting
const sunlight = new THREE.PointLight(0xffffff, 2, 100);
sunlight.position.set(0, 0, 0);
scene.add(sunlight);
const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
// consider difuse lighting so that the light bounces off multiple surfaces of the planets????
scene.add(ambientLight);

// Helper function to create planets
function createPlanet(size, color, distanceFromSun, texture = null) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    let material;

    if (texture) {
        const loader = new THREE.TextureLoader();
        material = new THREE.MeshStandardMaterial({ map: loader.load(texture) });
    } else {
        material = new THREE.MeshStandardMaterial({ color: color });
    }

    const planet = new THREE.Mesh(geometry, material);
    planet.position.x = distanceFromSun;

    return planet;
}

// Helper function to create rings
function createRing(planet, innerRadius, outerRadius, ringColor) {
    const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 32);
    const material = new THREE.MeshBasicMaterial({ color: ringColor, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(geometry, material);

    // Set initial diagonal orientation
    ring.rotation.x = Math.PI / 4; // Diagonal rotation
    planet.add(ring);

    // Returning the ring so you can manipulate it outside the function
    return ring;
}

// Helper function to add stars
function addStars() {
    const starsGeometry = new THREE.SphereGeometry(0.1, 24, 24);
    const starsMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const stars = new THREE.Group();

    for (let i = 0; i < 1000; i++) {
        const star = new THREE.Mesh(starsGeometry, starsMaterial);
        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(200)); // Spread them out
        star.position.set(x, y, z);
        stars.add(star);
    }

    scene.add(stars);
}

addStars(); // Call function to add stars

// Sun
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Mercury
const mercury = createPlanet(0.383, 0x909090, 7); // Size, color, and distance from Sun adjusted for visualization
scene.add(mercury);

// Venus
const venus = createPlanet(0.949, 0xFFD700, 9); // Size, color, and distance from Sun adjusted for visualization
scene.add(venus);

// Earth
const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
const earthMaterial = new THREE.MeshPhongMaterial({ color: 0x2233ff, specular: 0x555555, shininess: 15 });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.position.x = 13;
scene.add(earth);

// Moon
const moonGeometry = new THREE.SphereGeometry(0.27, 32, 32);
const moonMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.position.x = earth.position.x + 1.5; // Keep the moon close to earth
scene.add(moon);

// Mars
const mars = createPlanet(0.6, 0xFF4500, 18); // Using the `createPlanet` function
scene.add(mars);

// Jupiter - Assuming you add Jupiter
const jupiter = createPlanet(2.5, 0xB9A159, 26); // Example size and distance
scene.add(jupiter);

// Saturn
const saturn = createPlanet(2.5, 0xF4C542, 34);
scene.add(saturn);
// Saturn's Ring
const saturnRing = createRing(saturn, 3.0, 3.1, 0x888888);

// Uranus
const uranus = createPlanet(1.0, 0xD98BA, 44)
scene.add(uranus);
// Uranus ring 
const uranusRing = createRing(uranus, 1.7, 1.8, 0x888888);

// Neptune 
const neptune = createPlanet(1.0, 0x07FFF, 53)
scene.add(neptune);
// Neptune Ring 
const neptuneRing = createRing(neptune, 1.7, 1.8, 0x888888);

// Pluto

earth.name = 'earth';
moon.name = 'moon';
mercury.name = 'mercury';
venus.name = 'venus';
mars.name = 'mars';
jupiter.name = 'jupiter';
saturn.name = 'saturn';
uranus.name = 'uranus';
neptune.name = 'neptune';

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 10;
controls.maxDistance = 50;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.target.set(sun.position.x, sun.position.y, sun.position.z);

const animationState = {
    running: false,
    progress: 0,
    duration: 10000, // Duration of one orbit in milliseconds
};

// Helper function for bounding box calculations
function calculateSceneBoundingBox() {
    const boundingBox = new THREE.Box3();

    scene.traverse(function (object) {
        if (object.isMesh) {
            object.geometry.computeBoundingBox();
            boundingBox.expandByObject(object);
        }
    });

    return boundingBox;
}

// Helper function to define the optimal camera position for the scene 
function getOptimalCameraDistance(boundingBox) {
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 4 * Math.tan(fov * 2)); // Basic trigonometry
    
    cameraZ *= 2; // Adjust based on your scene requirements
    return cameraZ;
}

// Helper function to calculate the updated FOV for zoom out 
function calculateNewFOV(boundingBox, cameraPosition) {
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = cameraPosition.distanceTo(boundingBox.getCenter(new THREE.Vector3()));

    // Calculate the FOV required to fit the largest dimension
    const fov = 2 * Math.atan(maxDim / (2 * distance)) * (180 / Math.PI); // Convert radians to degrees
    return fov;
}

// Define orbital speeds relative to Earth; these are not accurate but serve to demonstrate the concept.
// In reality, orbital speed is determined by a variety of factors including the distance from the Sun.
const orbitalSpeeds = {
    mercury: 2.15, // Completes an orbit much faster than Earth
    venus: 1.32,
    earth: 1, // Base speed
    mars: 0.8,
    jupiter: 0.73,
    saturn: 0.52,
    uranus: 0.32,
    neptune: 0.28
};

// Define an object holding references to each planet
const planets = {
    mercury: mercury,
    venus: venus,
    earth: earth,
    mars: mars,
    jupiter: jupiter,
    saturn: saturn,
    uranus: uranus,
    neptune: neptune,
};

const earthOrbitRadius = 10; // baseline for calculations
const orbitRadii = {
    mercury: earthOrbitRadius * 0.39,
    venus: earthOrbitRadius * 0.72,
    earth: earthOrbitRadius,
    mars: earthOrbitRadius * 1.52,
    jupiter: earthOrbitRadius * 5.20,
    saturn: earthOrbitRadius * 9.58,
    uranus: earthOrbitRadius * 19.22,
    neptune: earthOrbitRadius * 30.05,
};

// Assuming you have already defined the planets objects somewhere
planets.mercury.userData = { orbitRadius: orbitRadii.mercury, speedFactor: 4.15 };
planets.venus.userData = { orbitRadius: orbitRadii.venus, speedFactor: 1.62 };
planets.earth.userData = { orbitRadius: orbitRadii.earth, speedFactor: 1 };
planets.mars.userData = { orbitRadius: orbitRadii.mars, speedFactor: 0.8 };
planets.jupiter.userData = { orbitRadius: orbitRadii.jupiter, speedFactor: 0.43 };
planets.saturn.userData = { orbitRadius: orbitRadii.saturn, speedFactor: 0.32 };
planets.uranus.userData = { orbitRadius: orbitRadii.uranus, speedFactor: 0.22 };
planets.neptune.userData = { orbitRadius: orbitRadii.neptune, speedFactor: 0.18 };

// Global variable to control the animation state
let animationRunning = false; // Assume animation is stopped initially

function startAnimation() {
    if (!animationRunning) {
        animationRunning = true;
        animate(); // Only call animate() if it's not already running
    }
}

function stopAnimation() {
    animationRunning = false; // This will stop the animation loop on the next frame
}

function animate() {
    requestAnimationFrame(animate);

    if (animationRunning) {
        animationState.progress += 1000 / 60; // Increment based on 60 FPS

        // Instead of stopping the animation, you might want to loop the progress.
        //animationState.progress = animationState.progress % animationState.duration; // Loop logic

        // Orbital speeds (arbitrary units, smaller means faster)
        const orbitalSpeeds = {
            mercury: 4.15, // Completes an orbit faster
            venus: 1.62,
            earth: 1,
            mars: 0.53,
            jupiter: 0.084,
            saturn: 0.034,
            uranus: 0.012,
            neptune: 0.006, // Completes an orbit slower
        };

        Object.keys(orbitalSpeeds).forEach(planetName => {
            const planet = planets[planetName]; // Access from the planets object
            if (!planet || !planet.userData) {
                console.error('Missing userData for:', planetName);
                return;
            }
            const orbitRadius = planet.userData.orbitRadius;
            const speedFactor = orbitalSpeeds[planetName];
            const planetProgress = (animationState.progress * speedFactor) % animationState.duration;
            const progressRatio = planetProgress / animationState.duration;
            const angle = progressRatio * 2 * Math.PI;
        
            planet.position.x = Math.cos(angle) * orbitRadius;
            planet.position.z = Math.sin(angle) * orbitRadius;
        });
    }

    // Static rotations for visual effect
    rotatePlanetsAndMoons();

    controls.update();
    composer.render();
}

function rotatePlanetsAndMoons() {
    // Your existing rotation logic
    // Earth and Moon rotation and Moon orbit
    earth.rotation.y += 0.005;
    moon.rotation.y += 0.003;
    if (!animationState.running) { // Only update Moon's orbit from here if not animating orbit
        moon.position.set(
            earth.position.x + Math.cos(Date.now() * 0.001) * 2,
            0,
            earth.position.z + Math.sin(Date.now() * 0.001) * 2
        );
    }

    // Rotate Saturn and its ring
    saturnRing.rotation.y += 0.01;
    saturn.rotation.y += 0.004;

    // Rotate Mars
    mars.rotation.y += 0.004;

    // Rotate Neptune and Uranus
    neptune.rotation.y += 0.004;
    uranus.rotation.y += 0.004;

    // Rotate rings of Neptune and Uranus
    uranusRing.rotation.y += 0.01;
    neptuneRing.rotation.y += 0.01;
}

document.getElementById('zoomOutButton').addEventListener('click', function () {
    const boundingBox = calculateSceneBoundingBox();
    const distance = getOptimalCameraDistance(boundingBox);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);

    // Adjust the camera position
    camera.position.set(center.x, center.y, distance);
    controls.target.set(center.x, center.y, 0);

    // Calculate and set the new FOV
    const newFOV = calculateNewFOV(boundingBox, camera.position);
    camera.fov = newFOV;
    camera.updateProjectionMatrix(); // Important to apply the new FOV

    controls.update();
});

// Start Animation Button
document.getElementById('startButton').addEventListener('click', function() {
    animationRunning = true; // Assuming animationRunning is a global variable controlling the animation
    animate(); // Start the animation if not already running
});

// Stop Animation Button
document.getElementById('stopButton').addEventListener('click', function() {
    animationRunning = false; // This will stop the animation loop
});

requestAnimationFrame(animate);
// animate();