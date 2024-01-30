// Vertex shader program
const vertexShaderSource = `
attribute vec4 aVertexPosition;     // Position attribute for vertices
uniform mat4 uModelViewMatrix;     // Model view matrix (combines model and view transformations)
uniform mat4 uProjectionMatrix;    // Projection matrix

void main() {
    // Calculate final position of the vertex
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
`;

// Fragment shader program
const fragmentShaderSource = `
precision mediump float;       // Set the default precision for floats
uniform vec4 uColor;           // Color uniform used for fragment coloring

void main() {
    // Set the color of the pixel
    gl_FragColor = uColor;
}
`;;

// Define the properties for Cube 1
let cube1 = {
    position: [0.0, 0.0, 0.0], // x, y, z position
    rotation: { angle: 0.0, axis: [0, 1, 0] }, // Rotation angle in radians and axis
    scale: [1.0, 1.0, 1.0], // Scale in x, y, z
    color: [1.0, 0.0, 1.0] // RGB color (pink)
};

// Define the properties for Cube 2
let cube2 = {
    position: [2.0, 0.0, 0.0], // Different x position
    rotation: { angle: 0.0, axis: [0, 1, 0] },
    scale: [1.0, 1.0, 1.0],
    color: [1.0, 1.0, 1.0] // RGB color (white)
};

function main() {
    // Setup WebGL context
    const canvas = document.getElementById('glCanvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        alert('Unable to initialize WebGL.');
        return;
    }

    // Load shaders, initilaize buffers, etc. 
    // Initialize shaders and program
    const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
    // More WebGL setup will go here
    // TODO

    // Accessing the HTML elements
    const cube1RotationSlider = document.getElementById('cube1-rotation-slider');
    const cube2RotationSlider = document.getElementById('cube2-rotation-slider');
    const cube1ScaleSlider = document.getElementById('cube1-scale-slider');
    const cube2ScaleSlider = document.getElementById('cube2-scale-slider');
    const cube1WireframeCheckbox = document.getElementById('cube1-wireframe-checkbox');
    const cube2WireframeCheckbox = document.getElementById('cube2-wireframe-checkbox');

    // Setup event listeners
    // Event listener for Cube 1 Rotation Slider
    cube1RotationSlider.addEventListener('input', function() {
        cube1.rotationAngle = parseFloat(this.value) * Math.PI / 180; // Convert degrees to radians
    });

    // Event listener for Cube 2 Rotation Slider
    cube2RotationSlider.addEventListener('input', function() {
        cube2.rotationAngle = parseFloat(this.value) * Math.PI / 180; // Convert degrees to radians
    });

    // Event listener for Cube 1 Scale Slider
    cube1ScaleSlider.addEventListener('input', function() {
        cube1.scale = [parseFloat(this.value), parseFloat(this.value), parseFloat(this.value)];
    });

    // Event listener for Cube 2 Scale Slider
    cube2ScaleSlider.addEventListener('input', function() {
        cube2.scale = [parseFloat(this.value), parseFloat(this.value), parseFloat(this.value)];
    });

    // Event listener for Cube 1 Wireframe Checkbox
    cube1WireframeCheckbox.addEventListener('change', function() {
        cube1WireframeMode = this.checked;
    });

    // Event listener for Cube 2 Wireframe Checkbox
    cube2WireframeCheckbox.addEventListener('change', function() {
        cube2WireframeMode = this.checked;
    });

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // More setup and rendering code will be added here
    
    // Start the rendering loop
    requestAnimationFrame(render);
}


function initShaderProgram(gl, vertexShaderSrc, fragmentShaderSrc) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);

    // Create the shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function createCube(gl) {
    const vertices = [
        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,

        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Right face
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
    ];

    const normals = [
        // Front
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,

        // Back
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,

        // Top
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,

        // Bottom
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,

        // Right
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,

        // Left
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
    ];

    // Indices define which vertices make up each triangle
    const indices = [
        0, 1, 2,     0, 2, 3,    // Front face
        4, 5, 6,     4, 6, 7,    // Back face
        8, 9, 10,    8, 10, 11,  // Top face
        12, 13, 14,  12, 14, 15, // Bottom face
        16, 17, 18,  16, 18, 19, // Right face
        20, 21, 22,  20, 22, 23, // Left face
    ];

    // Bind vertex buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Bind normal buffer
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    // Bind index buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        vertices: vertexBuffer,
        normals: normalBuffer,
        indices: indexBuffer,
        vertexCount: indices.length
    };
}

function setCubeTransformationsAndUniforms(cube) {
    // Model matrix combines all transformations
    let modelMatrix = mat4.create(); // Initialize to identity matrix

    // Apply translation
    mat4.translate(modelMatrix, modelMatrix, cube.position);

    // Apply rotation
    mat4.rotate(modelMatrix, modelMatrix, cube.rotationAngle, cube.rotationAxis);

    // Apply scaling
    mat4.scale(modelMatrix, modelMatrix, cube.scale);

    // Set the model matrix uniform in the shader
    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);

    // Set the color uniform in the shader
    gl.uniform3fv(colorUniformLocation, cube.color);
}

function setupCubeBuffers() {
    let vertices = [
        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,

        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Right face
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
    ];

    let normals = [
        // Front
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,

        // Back
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,

        // Top
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,

        // Bottom
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,

        // Right
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,

        // Left
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
    ];

    // Indices define which vertices make up each triangle
    let indices = [
        0, 1, 2,     0, 2, 3,    // Front face
        4, 5, 6,     4, 6, 7,    // Back face
        8, 9, 10,    8, 10, 11,  // Top face
        12, 13, 14,  12, 14, 15, // Bottom face
        16, 17, 18,  16, 18, 19, // Right face
        20, 21, 22,  20, 22, 23, // Left face
    ];

    // Create and bind the vertex buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Create and bind the index buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // Create and bind the normal buffer
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    // Return buffers for later use
    return {
        vertex: vertexBuffer,
        index: indexBuffer,
        normal: normalBuffer,
        indicesLength: indices.length
    };
}

function drawCube(buffers) {
    // Bind and set up the vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
    gl.vertexAttribPointer(vertexPositionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPositionAttributeLocation);

    // Bind and set up the normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.vertexAttribPointer(vertexNormalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexNormalAttributeLocation);

    // Bind the index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);

    // Draw the cube
    gl.drawElements(gl.TRIANGLES, buffers.indicesLength, gl.UNSIGNED_SHORT, 0);
}

function renderCube(cube, buffers, wireframeMode) {
    setCubeTransformationsAndUniforms(cube);

    if (wireframeMode) {
        gl.drawElements(gl.LINES, buffers.indicesLength, gl.UNSIGNED_SHORT, 0);
    } else {
        drawCube(buffers);
    }
}

function render() {
    // Clear the canvas and the depth buffer for a clean frame
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set up the perspective projection matrix
    let fieldOfView = 45 * Math.PI / 180; // Convert FOV from degrees to radians
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight; // Aspect ratio of the canvas
    let zNear = 0.1; // Near clipping plane
    let zFar = 100.0; // Far clipping plane
    let projectionMatrix = mat4.create(); // Create a blank matrix
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar); // Fill the matrix with perspective values

    // Set up the view matrix for the camera
    let cameraPosition = [0, 0, 10]; // Position the camera along the Z-axis
    let lookAtPoint = [0, 0, 0]; // Look at the center of the scene
    let upDirection = [0, 1, 0]; // Define which direction is 'up'
    let viewMatrix = mat4.create(); // Create a blank matrix for the view
    mat4.lookAt(viewMatrix, cameraPosition, lookAtPoint, upDirection); // Define the view based on the camera

    // Pass the projection and view matrices to the shader
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
    gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);

    // Render each cube with its own transformations and wireframe mode
    renderCube(cube1, cubeBuffers, cube1WireframeMode);
    renderCube(cube2, cubeBuffers, cube2WireframeMode);

    // Request the next frame for animation
    requestAnimationFrame(render);
}

window.onload = main;