// sor.js

let sorInstances = []

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


// Render loop
function render() {
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Loop through each SOR instance and draw it
    sorInstances.forEach(instance => {
        // Apply transformations to the instance
        instance.applyTransformations();

        // Update buffers with the transformed vertices and normals
        updateBuffers(gl, instance.vertexBuffer, instance.normalBuffer, instance.vertices, instance.normals);

        // Set up WebGL to use the updated buffers
        setupBufferAttributes(gl, instance);

        // Draw the SOR instance
        drawSOR(gl, instance, shaderProgram);
    });

    // Request to render the next frame
    requestAnimationFrame(render);
}

// Start rendering
render();

function transformNormals(normals, rotationMatrix) {
    // Apply only the rotation part of the transformation to the normals
    return normals.map(normal => {
        // Apply rotation matrix to the normal
        return multiplyMatrixAndPoint(rotationMatrix, normal);
    });
}

function multiplyMatrixAndPoint(matrix, point) {
    // Assumes matrix is a 4x4 and point is a 3D vector
    let result = [];
    for (let i = 0; i < 3; i++) {
        result[i] = matrix[i][0] * point[0] + matrix[i][1] * point[1] + matrix[i][2] * point[2];
    }
    return result;
}

class SORInstance {
    constructor(vertices, polygons, normals, color) {
        this.vertices = vertices;  // Origianl vertex data
        this.polygons = polygons; // Array of polygons (indices of vertices)
        this.normals = this.calculateNormals();    // Original normal data
        this.vertices = [...vertices];    // Transformed vertices
        this.normals = [...normals];      // Transformed normals
        this.color = color;        // Color of the SOR
        this.transform = {
            translate: [0, 0, 0], // Translation vector
            rotate: [0, 0, 0],    // Rotation angles (x, y, z)
            scale: [1, 1, 1]      // Scaling factors (x, y, z)
        };
    }

    calculateNormals() {
        const normals = [];
        for (const polygon of this.polygons) {
            const [i1, i2, i3] = polygon;
            const v1 = this.vertices[i1];
            const v2 = this.vertices[i2];
            const v3 = this.vertices[i3];
    
            // Compute vectors for two edges of the triangle
            const edge1 = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
            const edge2 = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];
    
            // Compute the normal using the cross product of the edges
            const normal = [
                edge1[1] * edge2[2] - edge1[2] * edge2[1],
                edge1[2] * edge2[0] - edge1[0] * edge2[2],
                edge1[0] * edge2[1] - edge1[1] * edge2[0]
            ];
    
            // Normalize the normal vector
            const length = Math.sqrt(normal[0] ** 2 + normal[1] ** 2 + normal[2] ** 2);
            normals.push(normal.map(n => n / length));
        }
        return normals;
    }

    // Translation 
    translateVertex(vertex, translate) {
        return [
            vertex[0] + translate[0],
            vertex[1] + translate[1],
            vertex[2] + translate[2]
        ];
    }

    // Rotation 
    rotateVertex(vertex, rotate) {
        let rotatedVertex = this.rotateX(vertex, rotate[0]);
        rotatedVertex = this.rotateY(rotatedVertex, rotate[1]);
        rotatedVertex = this.rotateZ(rotatedVertex, rotate[2]);
        return rotatedVertex;
    }

    // Scaling 
    scaleVertex(vertex, scale) {
        return [
            vertex[0] * scale[0],
            vertex[1] * scale[1],
            vertex[2] * scale[2]
        ];
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

    // Method to apply all transformations to a vertex
    applyTransformationsToVertex(vertex, transform) {
        let transformedVertex = vertex;
    
        // Apply scaling
        transformedVertex = this.scaleVertex(transformedVertex, transform.scale);
    
        // Apply rotation
        transformedVertex = this.rotateVertex(transformedVertex, transform.rotate);
    
        // Apply translation
        transformedVertex = this.translateVertex(transformedVertex, transform.translate);
    
        return transformedVertex;
    }

    // Method to apply transformations to all vertices
    applyTransformations() {
        // this.vertices = this.transformVertices(this.originalVertices);
        // this.normals = this.transformNormals(this.originalNormals);
        this.vertices = this.originalVertices.map(vertex => {
            return this.applyTransformationsToVertex(vertex, this.transform);
        });
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
            return multiplyMatrixAndPoint(rotationMatrix, normal)
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
}

function createNewSOR(vertexData, polygonData) {
    // Parse vertex data
    const vertices = vertexData.map(line => {
        const parts = line.split(',');
        return parts.slice(1).map(Number); // Convert string parts to numbers
    });

    // Parse polygon data (assuming they are triangles)
    const polygons = polygonData.map(line => {
        const parts = line.split(' ');
        return parts.slice(1).map(idx => parseInt(idx) - 1); // Convert indices to zero-based
    });

    // Create a new SOR instance
    const newSOR = new SOR(vertices, polygons);

    // Add the new SOR instance to the global sorInstances array
    sorInstances.push(newSOR);
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

function updateBuffers(gl, vertexBuffer, normalBuffer, vertices, normals) {
    // Update the vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices.flat()), gl.STATIC_DRAW);

    // Update the normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals.flat()), gl.STATIC_DRAW);
}

function setupBufferAttributes(gl, instance) {
    // Bind the vertex buffer and set vertex attribute pointers
    gl.bindBuffer(gl.ARRAY_BUFFER, instance.vertexBuffer);
    // Assuming the position attribute location is known
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind the normal buffer and set normal attribute pointers
    gl.bindBuffer(gl.ARRAY_BUFFER, instance.normalBuffer);
    // Assuming the normal attribute location is known
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalAttributeLocation);

    // Other attribute setup if needed
}

// Function to draw a SOR object
function drawSOR(gl, instance, shaderProgram) {
    // Use the shader program
    gl.useProgram(shaderProgram);

    // Set the uniforms for the shader program, e.g., transformation matrices, color
    setShaderUniforms(gl, shaderProgram, instance);

    // Draw the SOR instance
    // This will depend on whether you're using gl.drawArrays or gl.drawElements
    gl.drawArrays(gl.TRIANGLES, 0, instance.vertices.length / 3);
}

// Add event listeners to UI controls
// For a rotation slider:
document.getElementById('rotation-slider').addEventListener('input', function(event) {
    // Update the rotation of the selected SOR instance
    let angle = parseFloat(event.target.value);
    selectedSORInstance.transform.rotate[0] = angle; // Assuming rotation around X-axis
    // Trigger a re-render
});

/*
// Function for handling mouse events
function setupMouseHandlers(canvas) {
    // Handle mouse down, move, up events for selecting and transforming SORs
    // Implement picking logic
    // Translate, rotate, and scale the selected SOR based on mouse movement
}

// Initialize mouse handling
setupMouseHandlers(document.getElementById('webgl-canvas'));
*/

// Render loop
function render() {
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Loop through each SOR instance and draw it
    sorInstances.forEach(instance => {
        // Apply transformations to the instance
        instance.applyTransformations();

        // Update buffers with the transformed vertices and normals
        updateBuffers(gl, instance.vertexBuffer, instance.normalBuffer, instance.vertices, instance.normals);

        // Set up WebGL to use the updated buffers
        setupBufferAttributes(gl, instance);

        // Draw the SOR instance
        drawSOR(gl, instance, shaderProgram);
    });

    // Request to render the next frame
    requestAnimationFrame(render);
}

// Start rendering
render();