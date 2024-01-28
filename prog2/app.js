document.addEventListener("DOMContentLoaded", function() {
    const sidesSlider = document.getElementById('sidesSlider');
    const applyButton = document.getElementById('applyButton');
    // Get WebGL context from the canvas
    const canvas = document.getElementById('webgl-canvas');
    const gl = canvas.getContext('webgl');
    // Initialize WebGL and other necessary setups here

    applyButton.addEventListener('click', function() {
        handleUserInput(sidesSlider.value);
    });
});

if (!gl) {
    alert('WebGL not supported in this browser');
    throw new Error('WebGL not supported');
}

// Shader sources (placeholders for now)
// Vertex shader program
const vsSource = `
attribute vec4 aVertexPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
`;

// Fragment shader program
const fsSource = `
void main() {
  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);  // Set the color to white
}
`;

// Function to create a shader, upload the source and compile it
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

// Create the shader program
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
const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
};
/*
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Shader program linking error:', gl.getProgramInfoLog(shaderProgram));
    gl.deleteProgram(shaderProgram);
    throw new Error('Shader program linking failed');
}
*/

function initBuffers(gl, vertices) {
    // Create a buffer for the vertex positions
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Pass the list of positions into WebGL to build the shape
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        vertexCount: vertices.length / 3,
    };
}

// Flatten the SOR vertices for WebGL
const sorVerticesFlat = [];
for (const vertex of sorObject.vertices) {
    sorVerticesFlat.push(vertex.x, vertex.y, vertex.z);
}

const buffers = initBuffers(gl, sorVerticesFlat);

function drawScene(gl, programInfo, buffers) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // Set the drawing position to the "identity" point
    const modelViewMatrix = mat4.create();

    // Move the drawing position
    mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);

    // Tell WebGL how to pull out the positions from the position buffer
    {
        const numComponents = 3;  // pull out 3 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set to the next
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

    // Set the shader uniforms
    gl.useProgram(programInfo.program);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    {
        const offset = 0;
        const vertexCount = buffers.vertexCount;
        gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
    }
}

drawScene(gl, programInfo, buffers);

function handleUserInput(sides) {
    // Assuming 'sides' is the new number of sides for the SOR
    const userSides = parseInt(sides);

    // Regenerate the SOR with new user settings
    const userSorObject = generateSOR(rotatedProfile, userSides);

    // Handling user inputs for transformations
    // Transformation parameters
    let rotation = [0, 0, 0]; // x, y, z rotation angles
    let translation = [0, 0, -5]; // x, y, z translation
    let scale = [1, 1, 1]; // x, y, z scale

    // Handle keyboard events for transformations
    window.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowUp': translation[1] += 0.1; break;
            case 'ArrowDown': translation[1] -= 0.1; break;
            // Add cases for other transformations
        }
    });

    // Regenerate the SOR with new user settings
    //const userSorObject = generateSOR(rotatedProfile, userSides);

    // Flatten the new SOR vertices
    const newSorVerticesFlat = [];
    for (const vertex of userSorObject.vertices) {
        newSorVerticesFlat.push(vertex.x, vertex.y, vertex.z);
    }

    // Reinitialize buffers with new data
    buffers = initBuffers(gl, newSorVerticesFlat);

    // Redraw the scene with new buffers
    drawScene(gl, programInfo, buffers);
}


