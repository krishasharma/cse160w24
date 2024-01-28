/* 
Step-by-Step Implementation:

Step 1: Enhancing the SOR Object
Add normals and material properties to the SOR structure.
Step 2: Computing Normals
Implement generateNormals() which calculates normals for each polygon.
Step 3: Transformations
Define a transformation structure.
Implement applyTransformations() that applies transformations to SOR instances.
Step 4: Rendering with Flat Shading
Modify renderSOR() to support flat shading.
Step 5: User Interaction
Implement UI controls for creating and transforming SOR instances.
Implement event handlers for these controls.
Step 6: Initialization
Set up the initial scene and default settings.
Step 7: Main Rendering Loop
Create a loop that continuously renders the scene.
*/

// Sample coordinates from prog0 
const prog0Coordinates = [
    { x: 0, y: 0 },
    { x: 100, y: 50 },
    { x: 200, y: 100 },
    // Add more coordinates as needed
];

// Vertex Shader Source
const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
`;

// Fragment Shader Source
const fragmentShaderSource = `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // Set the color to white
    }
`;

// Function to convert prog0 coordinates to webGL coordinates
function convertToWebGLCoordinates(coordinates, canvasWidth, canvasHeight) {
    const webGLCoordinates = [];

    // Loop through prog0 coordinates and perform the conversion
    for (const coord of coordinates) {
        // Convert X and Y to webGL coordinates (-1 to 1)
        const webGLX = (2 * coord.x / canvasWidth) - 1;
        const webGLY = 1 - (2 * coord.y / canvasHeight);

        // Push the converted coordinates into the result array
        webGLCoordinates.push({ x: webGLX, y: webGLY });
    }

    return webGLCoordinates;
}

// Canvas width based on the provided information
const canvasWidth = 501;

// Assume canvas height is the same as the width to create a square canvas
const canvasHeight = canvasWidth;

// Convert prog0 coordinates to webGL coordinates
const webGLCoordinates = convertToWebGLCoordinates(prog0Coordinates, canvasWidth, canvasHeight);

// Function to rotate the profile curve to XZ-plane or YZ-plane
function rotateProfileToPlane(coordinates, plane) {
    const rotatedCoordinates = [];

    // Loop through webGL coordinates and perform the rotation
    for (const coord of coordinates) {
        // Depending on the chosen plane, rotate the coordinates
        if (plane === 'XZ') {
            // Rotate to XZ-plane (P(X, Y, 0) -> P(X, 0, Y))
            rotatedCoordinates.push({ x: coord.x, y: 0, z: coord.y });
        } else if (plane === 'YZ') {
            // Rotate to YZ-plane (P(X, Y, 0) -> P(0, Y, X))
            rotatedCoordinates.push({ x: 0, y: coord.y, z: coord.x });
        } else {
            // Handle unsupported plane choice
            console.error("Invalid plane choice. Supported values are 'XZ' and 'YZ'.");
            return null;
        }
    }

    return rotatedCoordinates;
}

// Choose the plane to rotate the profile curve to ('XZ' or 'YZ')
const chosenPlane = 'XZ';

// Rotate the profile curve to the chosen plane
const rotatedProfile = rotateProfileToPlane(webGLCoordinates, chosenPlane);

// Function to generate the Surface of Revolution (SOR)
function generateSOR(profile, sides) {
    const sorVertices = [];
    const sorPolygons = [];
    // Add an empty array for normals which will be computed later
    const sorNormals = [];

    // Loop to create SOR vertices and polygons
    for (let i = 0; i <= sides; i++) {
        const angle = (i / sides) * 2 * Math.PI; // Angle increment based on the number of sides

        // Rotate profile points around the Z-axis
        for (const point of profile) {
            const x = point.x * Math.cos(angle);
            const y = point.x * Math.sin(angle);
            const z = point.y;

            // Add the rotated point as a vertex
            sorVertices.push({ x, y, z });
        }

        // Create polygons by connecting vertices
        if (i > 0) {
            const startIndex = (i - 1) * profile.length;
            const endIndex = i * profile.length;

            for (let j = 0; j < profile.length; j++) {
                const vertex1 = startIndex + j;
                const vertex2 = startIndex + (j + 1) % profile.length;
                const vertex3 = endIndex + j;
                const vertex4 = endIndex + (j + 1) % profile.length;

                // Create two triangles for each quad
                sorPolygons.push([vertex1, vertex2, vertex3]);
                sorPolygons.push([vertex2, vertex4, vertex3]);
            }
        }
        // After generating vertices and polygons, create a new SOR instance
        const sorObject = new SOR(sorVertices, sorPolygons, sorNormals);
        return sorObject;
    }

    // Handle end caps if required
    if (drawEndCaps) {
        // Index of the center of the base (bottom cap)
        baseCenterIndex = sorVertices.length;
        sorVertices.push({ x: 0, y: 0, z: profile[0].z });

        // Creating the base (bottom cap)
        for (let i = 0; i < sides; i++) {
            const vertex1 = baseCenterIndex;
            const vertex2 = i * profile.length;
            const vertex3 = ((i + 1) % sides) * profile.length;
            sorPolygons.push([vertex1, vertex2, vertex3]);
        }

        // Index of the center of the top (top cap)
        topCenterIndex = sorVertices.length;
        sorVertices.push({ x: 0, y: 0, z: profile[profile.length - 1].z });

        // Creating the top (top cap)
        for (let i = 0; i < sides; i++) {
            const vertex1 = topCenterIndex;
            const vertex2 = ((i + 1) % sides) * profile.length + profile.length - 1;
            const vertex3 = i * profile.length + profile.length - 1;
            sorPolygons.push([vertex1, vertex3, vertex2]);
        }
    }

    return { vertices: sorVertices, polygons: sorPolygons };
}

function generateNormals(sorObject) {
    for (const polygon of sorObject.polygons) {
        const vertex1 = sorObject.vertices[polygon[0]];
        const vertex2 = sorObject.vertices[polygon[1]];
        const vertex3 = sorObject.vertices[polygon[2]];

        // Calculate vectors
        const vector1 = { x: vertex2.x - vertex1.x, y: vertex2.y - vertex1.y, z: vertex2.z - vertex1.z };
        const vector2 = { x: vertex3.x - vertex1.x, y: vertex3.y - vertex1.y, z: vertex3.z - vertex1.z };

        // Compute the cross product
        let normal = {
            x: vector1.y * vector2.z - vector1.z * vector2.y,
            y: vector1.z * vector2.x - vector1.x * vector2.z,
            z: vector1.x * vector2.y - vector1.y * vector2.x
        };

        // Normalize the normal
        const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
        normal = { x: normal.x / length, y: normal.y / length, z: normal.z / length };

        // Assign the normal to the SOR object
        sorObject.normals.push(normal);
    }
}

// Number of sides for the SOR (e.g., 3 for triangular cross-section)
const sides = 3;

// Generate the Surface of Revolution (SOR) using the rotated profile and number of sides
const sorObject = generateSOR(rotatedProfile, sides, drawEndCaps);
generateNormals(userSorObject);


// Variable to store user input for sides and end caps (true for end caps, false for no end caps)
let userSides = 3; // Default number of sides
let drawEndCaps = true; // Default to draw end caps

// Function to handle user input
function handleUserInput() {
    // Prompt user for number of sides and end caps choice
    userSides = parseInt(prompt("Enter the number of sides for the cross-sectional shape (e.g., 3 for triangular):"));
    drawEndCaps = confirm("Do you want to draw end caps? (OK for yes, Cancel for no)");

    // Validate user input for sides (must be a positive integer)
    while (isNaN(userSides) || userSides <= 0) {
        alert("Invalid input for sides. Please enter a positive integer.");
        userSides = parseInt(prompt("Enter the number of sides for the cross-sectional shape (e.g., 3 for triangular):"));
    }

    // Prompt user for end caps choice
    const endCapsChoice = confirm("Do you want to draw end caps? (OK for yes, Cancel for no)");
    drawEndCaps = endCapsChoice;

    // Display user choices
    console.log(`User Choices - Sides: ${userSides}, Draw End Caps: ${drawEndCaps}`);
}

// Call the function to handle user input
handleUserInput();

// Generate the Surface of Revolution (SOR) using user-defined sides and end caps choice
const userSorObject = generateSOR(rotatedProfile, userSides);

// Function to create and save the SOR OBJ files
function createAndSaveSORFiles() {
    // Create the OBJ file content for coordinates
    let objCoordinates = `${userSorObject.vertices.length}\n`;
    for (let i = 0; i < userSorObject.vertices.length; i++) {
        const vertex = userSorObject.vertices[i];
        objCoordinates += `${i + 1},${vertex.x.toFixed(2)},${vertex.y.toFixed(2)},${vertex.z.toFixed(2)}\n`;
    }

    // Create the OBJ file content for polygons
    let objPolygons = `${userSorObject.polygons.length}\n`;
    for (let i = 0; i < userSorObject.polygons.length; i++) {
        const polygon = userSorObject.polygons[i];
        objPolygons += `tri${i + 1} ${polygon[0] + 1} ${polygon[1] + 1} ${polygon[2] + 1}\n`;
    }

    if (drawEndCaps) {
        // Calculate end cap vertices and polygons
        const numVertices = sorObject.vertices.length;
        const centerIndex1 = numVertices + 1; // Center vertex index for the first end cap
        const centerIndex2 = numVertices + 2; // Center vertex index for the second end cap

        // Add center vertices for end caps
        objCoordinates += `${centerIndex1},0,0,${rotatedProfile[0].z.toFixed(2)}\n`; // First end cap center
        objCoordinates += `${centerIndex2},0,0,${rotatedProfile[rotatedProfile.length - 1].z.toFixed(2)}\n`; // Second end cap center

        // Radius for end caps (maximum x-value from the profile)
        const radius = Math.max(...rotatedProfile.map(p => Math.abs(p.x)));

        // Add vertices and polygons for each end cap
        for (let i = 0; i <= userSides; i++) {
            const angle = (i / userSides) * 2 * Math.PI;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);

            // Add vertices for end caps
            objCoordinates += `${numVertices + i + 3},${x.toFixed(2)},${y.toFixed(2)},${rotatedProfile[0].z.toFixed(2)}\n`; // First end cap
            objCoordinates += `${numVertices + userSides + i + 3},${x.toFixed(2)},${y.toFixed(2)},${rotatedProfile[rotatedProfile.length - 1].z.toFixed(2)}\n`; // Second end cap

            // Only add polygons if not the last vertex (to avoid overlap)
            if (i < userSides) {
                // Add polygons for the first end cap
                objPolygons += `tri${sorObject.polygons.length + i * 2 + 1} ${centerIndex1} ${numVertices + i + 3} ${numVertices + i + 4}\n`;
                // Add polygons for the second end cap
                objPolygons += `tri${sorObject.polygons.length + i * 2 + 2} ${centerIndex2} ${numVertices + userSides + i + 3} ${numVertices + userSides + i + 4}\n`;
            }
        }
    }

    // Create Blob objects for the coordinates and polygons
    const coordinatesBlob = new Blob([objCoordinates], { type: 'text/plain' });
    const polygonsBlob = new Blob([objPolygons], { type: 'text/plain' });

    // Create Object URLs for downloading
    const coordinatesUrl = URL.createObjectURL(coordinatesBlob);
    const polygonsUrl = URL.createObjectURL(polygonsBlob);

    // Create download links for the files
    const coordinatesLink = document.createElement('a');
    coordinatesLink.href = coordinatesUrl;
    coordinatesLink.download = 'sor_coordinates.obj';

    const polygonsLink = document.createElement('a');
    polygonsLink.href = polygonsUrl;
    polygonsLink.download = 'sor_polygons.obj';

    // Click the links to trigger downloads
    coordinatesLink.click();
    polygonsLink.click();
}

// Call the function with the SOR object and the end caps choice
createAndSaveSORFiles();

function createSORBuffers(gl, sorObject) {
    // Create a buffer for the vertices
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    const vertices = sorObject.vertices.flatMap(v => [v.x, v.y, v.z]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Create a buffer for the normals
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    const normals = sorObject.normals.flatMap(n => [n.x, n.y, n.z]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    // Create a buffer for the indices
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    const indices = sorObject.polygons.flatMap(p => p);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        vertexBuffer,
        normalBuffer,
        indexBuffer,
        vertexCount: indices.length
    };
}

// Function to draw the SOR object using WebGL
function drawSOR(gl, program, buffers) {
    // Bind the vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    // Bind the normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normalBuffer);
    const normalLocation = gl.getAttribLocation(program, 'a_normal');
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLocation);

    // Bind the index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer);

    // Set up WebGL to use the shader program and draw the object
    gl.useProgram(program);
    gl.drawElements(gl.TRIANGLES, buffers.vertexCount, gl.UNSIGNED_SHORT, 0);
}

function createShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
    // Function to create and compile a shader
    function createShader(gl, type, source) {
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

    // Create and compile vertex and fragment shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Create and link the shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // Check if the shader program was linked successfully
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}


// Main function to initialize WebGL and draw the SOR
function main() {
    // Initialize WebGL context
   
    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        alert('Unable to initialize WebGL. Your browser may not support it.');
        return;
    }

    // Create and use shader program (assuming shaders are defined and compiled)
    const shaderProgram = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (!shaderProgram) {
        console.error('Unable to initialize the shader program.');
    }

    // Generate the SOR object
    const sorBuffers = createSORBuffers(gl, userSorObject);

    // Draw the SOR
    drawSOR(gl, shaderProgram, sorBuffers);
}

// Call the main function to start the process
main();