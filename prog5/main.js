import * as THREE from 'https://unpkg.com/three@0.125.2/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.125.2/examples/jsm/controls/OrbitControls.js';

// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10; // Adjust as necessary
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // An optional feature that adds inertia to the camera movement
controls.dampingFactor = 0.05;

// Heart shape setup
const x = 0, y = 0;
const heartShape = new THREE.Shape();
heartShape.moveTo(x + 25, y + 25);
heartShape.bezierCurveTo(x + 25, y + 25, x + 20, y, x, y);
heartShape.bezierCurveTo(x - 30, y, x - 30, y + 35, x - 30, y + 35);
heartShape.bezierCurveTo(x - 30, y + 55, x - 10, y + 77, x + 25, y + 95);
heartShape.bezierCurveTo(x + 60, y + 77, x + 80, y + 55, x + 80, y + 35);
heartShape.bezierCurveTo(x + 80, y + 35, x + 80, y, x + 50, y);
heartShape.bezierCurveTo(x + 35, y, x + 25, y + 25, x + 25, y + 25);

// Extrude Options
const extrudeSettings = {
    steps: 2, // Controls the number of rendered segments along the depth.
    depth: 2, // Depth of the extrusion aka how far to extrude the shape.
    bevelEnabled: true, // Flag for whether the edges should be beveled.
    bevelThickness: 1, // How "deep" the bevel goes.
    bevelSize: 1, // How far the bevel extends into the shape.
    bevelSegments: 2 //  The number of segments to use for the bevel.
};

/*
// Heart Geometry
const geometry = new THREE.ShapeGeometry(heartShape);
*/

// Heart Geometry - Extruding the shape to make it 3D
const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);

// The rest remains unchanged
const material = new THREE.MeshBasicMaterial({ color: 0xFF0000, side: THREE.DoubleSide });
const heart = new THREE.Mesh(geometry, material);

// Adjust the heart scale here
heart.scale.set(0.05, 0.05, 0.05); // Scale down since 3D objects can appear larger

scene.add(heart);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 1);
scene.add(directionalLight);

// Add a point light for dynamic shadows
const pointLight = new THREE.PointLight(0xFFFFFF, 1, 100);
pointLight.position.set(50, 50, 50);
scene.add(pointLight);

// Animation Function
function animate() {
    requestAnimationFrame(animate);

    // Update controls
    controls.update();

    // Adjust the heart's rotation
    heart.rotation.x = Math.PI;
    heart.rotation.y = Math.PI;

    // Heart pulse
    heart.scale.x = 1 + 0.1 * Math.sin(Date.now() * 0.005);
    heart.scale.y = 1 + 0.1 * Math.sin(Date.now() * 0.005);

    // Render the scene
    renderer.render(scene, camera);
}

// Checking if interactive elements exist before adding event listeners
const zoomElement = document.getElementById('zoom');
if (zoomElement) {
    zoomElement.addEventListener('input', function() {
        camera.position.z = this.value;
    });
}

const lightToggleElement = document.getElementById('lightToggle');
if (lightToggleElement) {
    lightToggleElement.addEventListener('change', function() {
        if (this.checked) {
            scene.add(light);
        } else {
            scene.remove(light);
        }
    });
}

function onWindowResize() {
    // Update camera aspect ratio to match new window dimensions
    camera.aspect = window.innerWidth / window.innerHeight;
    // Recompute the projection matrix with the new aspect ratio
    camera.updateProjectionMatrix();
    // Resize the renderer to fill the window
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Listen for window resize events
window.addEventListener('resize', onWindowResize, false);

animate();