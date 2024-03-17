
import * as THREE from 'https://unpkg.com/three@0.125.2/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.125.2/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://unpkg.com/three@0.125.2/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.125.2/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.125.2/examples/jsm/postprocessing/UnrealBloomPass.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Black for space

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(15, 10, -20);

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
function createRing(innerRadius, outerRadius, color, planet) {
    const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    
    // Position the ring to match the planet's position and rotate it to be perpendicular to the orbit
    // Adjust the ring's rotation to be perpendicular
    ring.rotation.x = Math.PI / 2;

    // Instead of positioning the ring, we attach it directly to the planet
    planet.add(ring);
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

// Earth
const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
const earthMaterial = new THREE.MeshPhongMaterial({ color: 0x2233ff, specular: 0x555555, shininess: 15 });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.position.x = 10;
scene.add(earth);

// Moon
const moonGeometry = new THREE.SphereGeometry(0.27, 32, 32);
const moonMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.position.x = 11.5;
scene.add(moon);

// Mars
const mars = createPlanet(0.6, 0xFF4500, 15); // Using the `createPlanet` function
scene.add(mars);

// Saturn
const saturn = createPlanet(1.2, 0xF4C542, 25);
scene.add(saturn);

// Attach Saturn's Ring
createRing(1.5, 2.2, 0x888888, saturn); // The ring is now a child of Saturn

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 10;
controls.maxDistance = 50;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;

function animate() {
    requestAnimationFrame(animate);

    // Simple animation for Earth and Moon
    earth.rotation.y += 0.005;
    moon.rotation.y += 0.003;
    moon.position.set(
        earth.position.x + Math.cos(Date.now() * 0.001) * 2,
        0,
        Math.sin(Date.now() * 0.001) * 2
    );

    // Rotate Saturn (the ring, being a child, rotates with it)
    saturn.rotation.y += 0.004;

    // Mars doesn't have a ring but let's keep it rotating for consistency
    mars.rotation.y += 0.004;

    // Update controls
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

    // Render the scene with the bloom effect
    composer.render();
}

animate();