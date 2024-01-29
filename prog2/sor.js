// sor.js

// Function to initialize WebGL context
function initWebGL(canvasId) {
    const canvas = document.getElementById(canvasId);
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not supported');
        return null;
    }

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);
    // Near things obscure far things
    gl.depthFunc(gl.LEQUAL);
    // Clear the color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    return gl;
}

// Function to compile shaders and create a WebGL program
function createShader(gl, type, source) {
    // Compile vertex and fragment shaders for flat shading
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initShaders(gl) {
    // Create vertex and fragment shaders, compile and link them
    // Return shader program
    const vertexShaderSource = `
        attribute vec4 aVertexPosition;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        }
    `;

    const fragmentShaderSource = `
        precision mediump float;
        uniform vec4 uFragmentColor;
        void main() {
            gl_FragColor = uFragmentColor;
        }
    `;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

// Main initialization
const gl = initWebGL('webgl-canvas');
if (gl) {
    const shaderProgram = initShaders(gl);
    // Further steps will follow, such as creating buffers, setting up transformations, etc.
}

// Function to create buffers for SOR vertices and normals
function createBuffers(gl, sorVertices, sorNormals) {
    // Create, bind, and populate buffers for vertices and normals
}

// Function to draw a SOR object
function drawSOR(gl, shaderProgram, buffers, transformationMatrix) {
    // Set shader uniforms, bind buffers
    // Apply transformations
    // Draw the object using gl.drawElements or gl.drawArrays
}

// Render loop
function render() {
    // Clear the canvas
    // For each SOR, create buffers and draw it
    requestAnimationFrame(render);
}

// Start rendering
render();

// Function for handling mouse events
function setupMouseHandlers(canvas) {
    // Handle mouse down, move, up events for selecting and transforming SORs
    // Implement picking logic
    // Translate, rotate, and scale the selected SOR based on mouse movement
}

// Initialize mouse handling
setupMouseHandlers(document.getElementById('webgl-canvas'));

// Add comments throughout the code
// For example:
// Initializes WebGL context and sets up shaders.
function initWebGL(canvasId) {
    // ...
}