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

// Vertex shader source
const vertexShaderSource = `
attribute vec4 aVertexPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
`;

// Fragment shader source
const fragmentShaderSource = `
precision mediump float;
uniform vec4 uFragmentColor;
uniform vec3 uLightDirection;
varying vec3 vNormal;
void main() {
    vec3 normalizedNormal = normalize(vNormal);
    float light = max(dot(normalizedNormal, uLightDirection), 0.0);
    vec4 diffuse = uFragmentColor * light;
    gl_FragColor = diffuse;
}
`;

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
function createBuffers(gl, sorData) {
    // Create, bind, and populate buffers for vertices and normals
    // Create a buffer for the SOR's vertices
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sorData.vertices), gl.STATIC_DRAW);

    // Create and bind the normal buffer
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sorData.normals), gl.STATIC_DRAW);

    return {
        vertex: vertexBuffer,
        normal: normalBuffer,
    };
}

// Function to draw a SOR object
function drawSOR(gl, shaderProgram, buffers, transformationMatrix) {
    // Set shader uniforms, bind buffers
    // Apply transformations
    // Draw the object using gl.drawElements or gl.drawArrays
    // Bind the vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
    const vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPosition);

    // Set the shader uniforms for transformation matrices
    const modelViewMatrixLoc = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');
    const projectionMatrixLoc = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
    const fragmentColorLoc = gl.getUniformLocation(shaderProgram, 'uFragmentColor');

    // Set the matrices and color here. For example:
    // gl.uniformMatrix4fv(modelViewMatrixLoc, false, transformationMatrix.modelView);
    // gl.uniformMatrix4fv(projectionMatrixLoc, false, transformationMatrix.projection);
    // gl.uniform4f(fragmentColorLoc, 1.0, 0.0, 0.0, 1.0); // Red color for example

    // Draw the object
    // gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);
}

// Render loop
function render() {
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create transformation matrices
    const transformationMatrix = {
        modelView: /* ModelView matrix */,
        projection: /* Projection matrix */
    };

    // For each SOR, create buffers and draw it
    sorObjects.forEach(sor => {
        const buffers = createBuffers(gl, sor);
        drawSOR(gl, shaderProgram, buffers, transformationMatrix);
    });

    // Request to render the next frame
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

class SORInstance {
    constructor(vertices, normals, color) {
        this.vertices = vertices;  // Origianl vertex data
        this.normals = normals;    // Original normal data
        this.vertices = [...vertices];    // Transformed vertices
        this.normals = [...normals];      // Transformed normals
        this.color = color;        // Color of the SOR
        this.transform = {
            translate: [0, 0, 0], // Translation vector
            rotate: [0, 0, 0],    // Rotation angles (x, y, z)
            scale: [1, 1, 1]      // Scaling factors (x, y, z)
        };
    }

    rotateX(x, y, z, angle) {
        const cosTheta = Math.cos(angle);
        const sinTheta = Math.sin(angle);
        return [
            x,
            cosTheta * y - sinTheta * z,
            sinTheta * y + cosTheta * z
        ];
    }

    rotateY(x, y, z, angle) {
        const cosTheta = Math.cos(angle);
        const sinTheta = Math.sin(angle);
        return [
            cosTheta * x + sinTheta * z,
            y,
            -sinTheta * x + cosTheta * z
        ];
    }

    rotateZ(x, y, z, angle) {
        const cosTheta = Math.cos(angle);
        const sinTheta = Math.sin(angle);
        return [
            cosTheta * x - sinTheta * y,
            sinTheta * x + cosTheta * y,
            z
        ];
    }

    applyTransformations() {
        this.vertices = this.transformVertices(this.originalVertices);
        this.normals = this.transformNormals(this.originalNormals);
    }

    transformVertices(vertices) {
        return vertices.map(vertex => {
            // Apply scale
            let [x, y, z] = vertex.map((v, i) => v * this.transform.scale[i]);
            // Apply rotation
            [x, y, z] = this.applyRotation(x, y, z);
            // Apply translation
            return [x + this.transform.translate[0], y + this.transform.translate[1], z + this.transform.translate[2]];
        });
    }

    transformNormals(normals) {
        return normals.map(normal => {
            // Normals are only rotated, not scaled or translated
            return this.applyRotation(...normal);
        });
    }

    applyRotation(x, y, z) {
        // Apply rotation around each axis
        // This requires implementing or using a library for matrix operations
        // Here, you would apply the rotation matrices for X, Y, and Z axes
        [x, y, z] = rotateX(x, y, z, this.transform.rotate[0]);
        [x, y, z] = rotateY(x, y, z, this.transform.rotate[1]);
        [x, y, z] = rotateZ(x, y, z, this.transform.rotate[2]);
        return [x, y, z];
    }

    // Additional methods for rotateX, rotateY, rotateZ can be added
}