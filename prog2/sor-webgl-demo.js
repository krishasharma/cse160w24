// Get the canvas element and initialize the WebGL context
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
    return;
}

// Set clear color to black, fully opaque
gl.clearColor(0.0, 0.0, 0.0, 1.0);
// Clear the color buffer with specified clear color
gl.clear(gl.COLOR_BUFFER_BIT);

const cubeVertices = [
    // Front face
    -1.0, -1.0,  1.0, // Vertex 0
     1.0, -1.0,  1.0, // Vertex 1
     1.0,  1.0,  1.0, // Vertex 2
    -1.0,  1.0,  1.0, // Vertex 3

    // Back face
    -1.0, -1.0, -1.0, // Vertex 4
     1.0, -1.0, -1.0, // Vertex 5
     1.0,  1.0, -1.0, // Vertex 6
    -1.0,  1.0, -1.0, // Vertex 7

    // Top face
    -1.0,  1.0, -1.0, // Vertex 8 (same as Vertex 7)
     1.0,  1.0, -1.0, // Vertex 9 (same as Vertex 6)
     1.0,  1.0,  1.0, // Vertex 10 (same as Vertex 2)
    -1.0,  1.0,  1.0, // Vertex 11 (same as Vertex 3)

    // Bottom face
    -1.0, -1.0, -1.0, // Vertex 12 (same as Vertex 4)
     1.0, -1.0, -1.0, // Vertex 13 (same as Vertex 5)
     1.0, -1.0,  1.0, // Vertex 14 (same as Vertex 1)
    -1.0, -1.0,  1.0, // Vertex 15 (same as Vertex 0)

    // Right face
     1.0, -1.0, -1.0, // Vertex 16 (same as Vertex 5)
     1.0,  1.0, -1.0, // Vertex 17 (same as Vertex 6)
     1.0,  1.0,  1.0, // Vertex 18 (same as Vertex 2)
     1.0, -1.0,  1.0, // Vertex 19 (same as Vertex 1)

    // Left face
    -1.0, -1.0, -1.0, // Vertex 20 (same as Vertex 4)
    -1.0, -1.0,  1.0, // Vertex 21 (same as Vertex 0)
    -1.0,  1.0,  1.0, // Vertex 22 (same as Vertex 3)
    -1.0,  1.0, -1.0, // Vertex 23 (same as Vertex 7)
];

const cubeIndices = [
    // Front face
    0, 1, 2,    0, 2, 3,

    // Back face
    4, 5, 6,    4, 6, 7,

    // Top face
    8, 9, 10,   8, 10, 11,

    // Bottom face
    12, 13, 14, 12, 14, 15,

    // Right face
    16, 17, 18, 16, 18, 19,

    // Left face
    20, 21, 22, 20, 22, 23
];

const cubeWireframeIndices = [
    // Front face
    0, 1, 1, 2, 2, 3, 3, 0,
    // Back face
    4, 5, 5, 6, 6, 7, 7, 4,
    // Top face
    3, 2, 2, 6, 6, 7, 7, 3,
    // Bottom face
    0, 1, 1, 5, 5, 4, 4, 0,
    // Right face
    1, 2, 2, 6, 6, 5, 5, 1,
    // Left face
    0, 3, 3, 7, 7, 4, 4, 0
];

// Vertex Shader Code
const vsSource = `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
`;

// Fragment Shader Code
const fsSource = `
    precision mediump float;
    uniform vec4 uColor;

    void main() {
        gl_FragColor = uColor; // Set the color of the pixel
    }
`;

// Global variables for transformations
var cubeRotation = 0.0;
var cubeScale = 1.0;

// Function to initialize event listeners for sliders
function initEventListeners() {
    const rotationSlider = document.getElementById('rotationSlider');
    const scaleSlider = document.getElementById('scaleSlider');

    rotationSlider.addEventListener('input', function() {
        cubeRotation = this.value * Math.PI / 180; // Convert degrees to radians
    });

    scaleSlider.addEventListener('input', function() {
        cubeScale = this.value;
    });
}

// Call this function at the end of the `init` function
initEventListeners();

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

function initBuffers(gl) {
    // Create a buffer for the cube's vertices.
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);

    // Create a buffer for the cube's indices.
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    return {
        vertex: vertexBuffer,
        indices: indexBuffer
    };
}

const buffers = initBuffers(gl);

function initWireframeBuffers(gl) {
    const wireframeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wireframeIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeWireframeIndices), gl.STATIC_DRAW);

    return {
        wireframeIndices: wireframeIndexBuffer,
    };
}

// During initialization
const wireframeBuffers = initWireframeBuffers(gl);

var rotation = 0.0;
var xRotation = 0.0;
var yRotation = 0.0;
var zRotation = 0.0;
var isWireframe = false;

// Function to handle keydown events
function keyDownHandler(event) {
    if (event.keyCode == 87) { // 'W' key for Wireframe
        isWireframe = !isWireframe;
    }
    if (event.keyCode == 37) { // Left arrow key
        yRotation -= 0.1;
    } else if (event.keyCode == 39) { // Right arrow key
        yRotation += 0.1;
    } else if (event.keyCode == 38) { // Up arrow key
        xRotation -= 0.1;
    } else if (event.keyCode == 40) { // Down arrow key
        xRotation += 0.1;
    } else if (event.keyCode == 87) { // 'W' key
        isWireframe = !isWireframe;
    }
}

document.addEventListener('keydown', keyDownHandler, false);

function drawScene(gl, programInfo, buffers) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set the color to blue
    const color = [0.0, 0.0, 1.0, 1.0]; // RGBA, here blue

    // Create a perspective matrix
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create(); // using gl-matrix library for matrix operations
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // Set the drawing position to the "identity" point, which is the center of the scene.
    const modelViewMatrix = mat4.create();

    // Move to where we want to start drawing the square.
    mat4.translate(modelViewMatrix,     // destination matrix
                   modelViewMatrix,     // matrix to translate
                   [-0.0, 0.0, -6.0]);  // amount to translate
    mat4.rotate(modelViewMatrix,  // destination matrix
                modelViewMatrix,  // matrix to rotate
                rotation,         // amount to rotate in radians
                [0, 0, 1]);       // axis to rotate around (Z)
    // Apply scaling
    mat4.scale(modelViewMatrix, modelViewMatrix, [cubeScale, cubeScale, cubeScale]);
    // Apply rotation
    mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 1, 0]); // Rotate around Y axis
    // Rotate the cube
    mat4.rotate(modelViewMatrix, modelViewMatrix, xRotation, [1, 0, 0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, yRotation, [0, 1, 0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, zRotation, [0, 0, 1]);

    if (isWireframe) {
        // Use wireframe buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wireframeBuffers);
        const vertexCount = cubeWireframeIndices.length;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.LINES, vertexCount, type, offset);
    } else {
        // Use normal buffer for flat shading
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
        const vertexCount = 36; // Total number of vertices in the cube indices
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
        const numComponents = 3;  // pull out 3 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
                                  // 0 = use type and numComponents above
        const offset = 0;         // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);
    gl.uniform4fv(programInfo.uniformLocations.uColor, color); // Set color uniform

    {
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
}

function init() {
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            uColor: gl.getUniformLocation(shaderProgram, 'uColor'), // Retrieve the location of uColor
        },
    };

    const buffers = initBuffers(gl);

    // Draw the scene repeatedly
    function render(now) {
        now *= 0.001;  // convert to seconds
        rotation = now;

        drawScene(gl, programInfo, buffers, wireframeBuffers);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

window.onload = init;