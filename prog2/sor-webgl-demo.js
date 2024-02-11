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

// Initializes event listeners for UI elements.
function initEventListeners() {
    // Access the rotation slider.
    const rotationSlider = document.getElementById('rotationSlider');
    // Access the scale slider.
    const scaleSlider = document.getElementById('scaleSlider');
    // Access the wireframe mode checkbox.
    const wireframeCheckbox = document.getElementById('wireframeCheckbox');

    // Event listener for rotation changes.
    rotationSlider.addEventListener('input', function() {
        // Update rotation: Convert degrees to radians.
        cubeRotation = this.value * Math.PI / 180;
    });

    // Event listener for scale changes.
    scaleSlider.addEventListener('input', function() {
        // Update scale based on slider value.
        cubeScale = this.value;
    });

    // Event listener for wireframe mode toggle.
    wireframeCheckbox.addEventListener('change', function() {
        // Toggle wireframe mode based on checkbox state.
        isWireframe = this.checked;
    });
}

// Call this function at the end of the `init` function
initEventListeners();

function loadShader(gl, type, source) {
    // Create a new shader object of the specified type (VERTEX_SHADER or FRAGMENT_SHADER)
    const shader = gl.createShader(type);

    // Set the GLSL source code for the shader
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // Check if the shader compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        // If the shader failed to compile, alert the user with the error log
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));

        // Delete the shader object to clean up resources
        gl.deleteShader(shader);

        // Return null to indicate that the shader failed to compile
        return null;
    }

    // Return the compiled shader object
    return shader;
}

function initShaderProgram(gl, vsSource, fsSource) {
    // Load and compile the vertex shader using the provided source code
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);

    // Load and compile the fragment shader using the provided source code
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create a new shader program object to link together the shaders
    const shaderProgram = gl.createProgram();

    // Attach the vertex shader to the program
    gl.attachShader(shaderProgram, vertexShader);

    // Attach the fragment shader to the program
    gl.attachShader(shaderProgram, fragmentShader);

    // Link the shaders into a complete shader program
    gl.linkProgram(shaderProgram);

    // Check if the shader program linked successfully
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        // If the linking failed, alert the user with the error log
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));

        // Return null to indicate that the program failed to link
        return null;
    }

    // Return the linked shader program
    return shaderProgram;
}

const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

function initBuffers(gl) {
    // Create a buffer for the cube's vertices.
    // This buffer will store the vertex coordinates of the cube.
    const vertexBuffer = gl.createBuffer();

    // Bind the created buffer to the ARRAY_BUFFER target.
    // ARRAY_BUFFER is used for vertex attributes like position.
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Pass the vertex data to the buffer.
    // new Float32Array(cubeVertices) creates a new typed array with the vertices.
    // gl.STATIC_DRAW hints to WebGL that the data will not change frequently.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);

    // Create a buffer for the cube's indices.
    // This buffer will store the indices of vertices to define the faces of the cube.
    const indexBuffer = gl.createBuffer();

    // Bind the created buffer to the ELEMENT_ARRAY_BUFFER target.
    // ELEMENT_ARRAY_BUFFER is used for element indices.
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // Pass the index data to the buffer.
    // new Uint16Array(cubeIndices) creates a typed array with the indices.
    // gl.STATIC_DRAW hints to WebGL that the data will not change frequently.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    // Return an object containing references to both buffers.
    // These will be used later in the rendering process.
    return {
        vertex: vertexBuffer,
        indices: indexBuffer
    };
}

// Initialize the buffers and store the returned objects.
// buffers.vertex will reference the vertex buffer.
// buffers.indices will reference the index buffer.
const buffers = initBuffers(gl);

function initWireframeBuffers(gl) {
    // Create a new buffer for storing wireframe indices
    const wireframeIndexBuffer = gl.createBuffer();

    // Bind the created buffer to the ELEMENT_ARRAY_BUFFER target
    // This target is used for element index arrays (like our wireframe indices)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wireframeIndexBuffer);

    // Pass the wireframe indices to the buffer
    // Using Uint16Array to hold the indices and gl.STATIC_DRAW as these 
    // indices won't change over time, optimizing GPU memory usage
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeWireframeIndices), gl.STATIC_DRAW);

    // Return an object with a reference to the wireframe index buffer
    // This buffer will be used when drawing the cube in wireframe mode
    return {
        wireframeIndices: wireframeIndexBuffer,
    };
}

// During initialization
const wireframeBuffers = initWireframeBuffers(gl);

// Initial overall rotation of the cube in radians.
var rotation = 0.0;
// Rotation of the cube around the X-axis in radians.
var xRotation = 0.0;
// Rotation of the cube around the Y-axis in radians.
var yRotation = 0.0;
// Rotation of the cube around the Z-axis in radians.
var zRotation = 0.0;
// Flag indicating whether the cube is in wireframe mode.
var isWireframe = false;

// Function to handle keydown events
function keyDownHandler(event) {
    // if (event.keyCode == 87) { // 'W' key for Wireframe
    //     isWireframe = !isWireframe;
    // }
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

function drawScene(gl, programInfo, buffers, wireframeBuffers) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // Set the drawing position to the "identity" point, which is the center of the scene.
    const modelViewMatrix = mat4.create();

    // Move the drawing position to where we want to start drawing the cube.
    mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);

    // Apply the rotation
    mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 0, 1]);
    // Apply scaling
    mat4.scale(modelViewMatrix, modelViewMatrix, [cubeScale, cubeScale, cubeScale]);

    // Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute
    {
        const numComponents = 3;  // pull out 3 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set to the next
        const offset = 0;         // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
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

    // Draw the cube in wireframe or solid mode based on isWireframe flag
    if (isWireframe) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wireframeBuffers.wireframeIndices);
        gl.drawElements(gl.LINES, cubeWireframeIndices.length, gl.UNSIGNED_SHORT, 0); 
    } else {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0); // two arrays, 8 points for the first, and then 6 faces, each face is a triangle, total 12, faces so 36 
    }
}

function init() {
    // Initialize the shader program by compiling and linking shader
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // Store shader program info, including attribute and uniform locations
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            // Get location of the vertex position attribute in the shader program
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        },
        uniformLocations: {
            // Get location of the projection matrix uniform
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            // Get location of the model-view matrix uniform
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            // Get location of the color uniform
            uColor: gl.getUniformLocation(shaderProgram, 'uColor'),
        },
    };

    // Initialize buffers (vertex, index, wireframe) for the cube
    const buffers = initBuffers(gl);

    // Define the rendering function, called repeatedly to draw the scene
    function render(now) {
        now *= 0.001;  // Convert time to seconds for rotation calculation
        rotation = now; // Update rotation based on the elapsed time

        // Draw the scene with current settings and buffers
        drawScene(gl, programInfo, buffers, wireframeBuffers);

        // Request to redraw the scene for the next frame
        requestAnimationFrame(render);
    }

    // Start the rendering loop
    requestAnimationFrame(render);
}

// Set init as the window onload handler to start the program
window.onload = init;