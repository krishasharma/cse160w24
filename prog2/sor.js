// sor.js

// Function to initialize WebGL context and shaders
function initWebGL(canvasId) {
    const canvas = document.getElementById(canvasId);
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    // Initialize shaders
    const shaderProgram = initShaders(gl);

    return { gl, shaderProgram };
}

// Function to create shader program
function initShaders(gl) {
    // Shader program setup for flat shading
    // Create vertex and fragment shaders, compile and link them
    // Return shader program
}

// Initialize the WebGL context and shaders
const { gl, shaderProgram } = initWebGL('webgl-canvas');
