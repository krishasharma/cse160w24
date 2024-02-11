
const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    void main() {
        gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 uColor;
    void main() {
        gl_FragColor = uColor;
    }
`;

function initShaders(gl) {
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

function createCubeVertices() {
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

    return vertices;
}

function createCubeNormals() {
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

    return normals;
}

function getProjectionMatrix(gl) {
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create(); // Using glMatrix library

    // mat4.perspective populates the given matrix with a perspective matrix.
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    return projectionMatrix;
}

function getViewMatrix() {
    const viewMatrix = mat4.create(); // Using glMatrix library
    const cameraPosition = [0, 0, 3]; // Positioned 3 units along Z-axis
    const lookAtPoint = [0, 0, 0];
    const upDirection = [0, 1, 0];

    // mat4.lookAt populates the given matrix to simulate camera position and orientation
    mat4.lookAt(viewMatrix, cameraPosition, lookAtPoint, upDirection);
    return viewMatrix;
}

function createCube() {
    const vertices = createCubeVertices();
    const normals = calculateNormals(vertices); // Implement this function
    const color = [1.0, 1.0, 1.0, 1.0]; // White color
    const transform = { scale: [1, 1, 1], rotate: [0, 0, 0], translate: [0, 0, 0] };

    return new SORInstance(vertices, normals, color, transform);
}

function createCubes() {
    const cube1 = createCube();
    const cube2 = createCube();
    // Position the second cube differently
    cube2.transform.translate = [2, 0, 0];

    sorInstances.push(cube1, cube2);
    selectedSORInstance = sorInstances[0];
}


function subtractVectors(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function crossProduct(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}

function normalize(v) {
    let length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    // Ensure the length is non-zero
    if (length > 0.00001) {
        return [v[0] / length, v[1] / length, v[2] / length];
    } else {
        return [0, 0, 0];
    }
}

// Implement normal calculation based on cube vertices
function calculateNormal(v0, v1, v2) {
    // Calculate vectors from the vertices
    let a = subtractVectors(v1, v0);
    let b = subtractVectors(v2, v0);

    // Cross product to find the normal
    let normal = crossProduct(a, b);

    // Normalize the vector (to make it a unit vector)
    return normalize(normal);
}

document.getElementById('rotation-slider').addEventListener('input', function(event) {
    let angle = parseFloat(event.target.value);
    if (selectedSORInstance) {
        selectedSORInstance.transform.rotate = [angle, angle, angle];
    }
});

function toggleWireframeMode() {
    wireframeMode = !wireframeMode;
    // Update the drawing mode accordingly
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const projectionMatrix = getProjectionMatrix(gl);
    const viewMatrix = getViewMatrix();

    sorInstances.forEach(instance => {
        instance.applyTransformations();
        updateBuffers(gl, instance.vertexBuffer, instance.normalBuffer, instance.vertices, instance.normals);
        setupBufferAttributes(gl, instance);

        // Set the shader uniforms for the projection and view matrices
        gl.uniformMatrix4fv(shaderProgram.projectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderProgram.viewMatrixUniform, false, viewMatrix);

        if (wireframeMode) {
            drawSORWireframe(gl, instance);
        } else {
            drawSOR(gl, instance, shaderProgram);
        }
    });

    requestAnimationFrame(render);
}

// Function to draw a SOR object
function drawSOR(gl, instance, shaderProgram) {
    // Use the shader program
    gl.useProgram(shaderProgram);

    // Bind the necessary buffers (vertex, index, possibly normals, etc.)
    // Assuming these buffers are properties of the 'instance' object
    gl.bindBuffer(gl.ARRAY_BUFFER, instance.vertexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    if (instance.normalBuffer) {
        gl.bindBuffer(gl.ARRAY_BUFFER, instance.normalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, instance.indexBuffer);

    // Set the uniforms for the shader program, e.g., transformation matrices, color
    setShaderUniforms(gl, shaderProgram, instance);

    // Draw the SOR instance
    // The number of indices is needed here, not the number of polygons
    gl.drawElements(gl.TRIANGLES, instance.indexCount, gl.UNSIGNED_SHORT, 0);
}

// Function to draw a wireframe of the SOR object
function drawSORWireframe(gl, instance, shaderProgram) {
    // Use the shader program
    gl.useProgram(shaderProgram);

    // Bind the vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, instance.vertexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    // No need for normal buffer in wireframe rendering

    // If you have a separate wireframe index buffer, bind it here
    // Otherwise, you can reuse the triangle index buffer but the drawing will be different
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, instance.wireframeIndexBuffer);

    // Set the uniforms for the shader program, e.g., transformation matrices
    setShaderUniforms(gl, shaderProgram, instance);

    // Draw the wireframe
    // If using a separate wireframe index buffer:
    gl.drawElements(gl.LINES, instance.wireframeIndexCount, gl.UNSIGNED_SHORT, 0);

    // If reusing the triangle index buffer, you might have to draw each edge separately
    // This is less efficient and more complex to set up
}

function updateBuffers(gl, vertexBuffer, normalBuffer, vertices, normals) {
    // Bind and set the vertices buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Bind and set the normals buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
}

function setupBufferAttributes(gl, instance) {
    // Set up the vertex attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, instance.vertexBuffer);
    gl.vertexAttribPointer(
        instance.attribLocations.vertexPosition,
        3, // Number of components per vertex attribute
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(instance.attribLocations.vertexPosition);

    // Set up the normal attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, instance.normalBuffer);
    gl.vertexAttribPointer(
        instance.attribLocations.vertexNormal,
        3, // Number of components per normal attribute
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(instance.attribLocations.vertexNormal);

    // Add any other buffer attributes setup here if needed
}

// MAIN
// Assuming you have a canvas in your HTML with id="glCanvas"
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    alert('Unable to initialize WebGL. Your browser may not support it.');
    // Exit if WebGL isn't available
}

// Initialize shaders (vertexShaderSource and fragmentShaderSource should be defined)
const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

// Collect all the information needed to use the shader program.
const programInfo = {
    program: shaderProgram,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
    },
    uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
    },
};

// Define and create a cube
const cubeVertices = createCubeVertices(); // Define this function to return your cube vertices
const cubeNormals = createCubeNormals(cubeVertices); // Define this function based on the vertex data

// Create and bind the buffers
const buffers = initBuffers(gl, cubeVertices, cubeNormals);

// Draw the scene repeatedly
/*function render(now) {
    drawScene(gl, programInfo, buffers);

    requestAnimationFrame(render);
}*/
// requestAnimationFrame(render);

let showWireframe = false; // This can be toggled by user input

function drawScene(gl, programInfo, buffers) {
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
    const projectionMatrix = mat4.create(); // Make sure to include gl-matrix
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // Set the drawing position to the "identity" point, which is the center of the scene.
    const modelViewMatrix = mat4.create();

    // Move the drawing position a bit to where we want to start drawing the square.
    mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);

    // Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute
    {
        const numComponents = 3;  // pull out 3 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
                                  // 0 = use type and numComponents above
        const offset = 0;         // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the normals from the normal buffer into the vertexNormal attribute.
    {
        const numComponents = 3; // pull out 3 values per iteration
        const type = gl.FLOAT; // the data in the buffer is 32bit floats
        const normalize = false; // don't normalize
        const stride = 0; // how many bytes to get from one set of values to the next
                          // 0 = use type and numComponents above
        const offset = 0; // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexNormal,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
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

    // Update the normal matrix and pass it to the shader
    let normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.normalMatrix,
        false,
        normalMatrix);

    {
        const vertexCount = 36; // Number of vertices for the cube (6 faces * 2 triangles * 3 vertices)
        const type = gl.UNSIGNED_SHORT; // the data in the element array buffer is 16bit unsigned shorts
        const offset = 0; // how many bytes inside the buffer to start from
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
}
