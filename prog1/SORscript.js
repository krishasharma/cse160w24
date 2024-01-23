/* 
OUTLINE FOR prog1 

// Global variables
let gl, program, vertexBuffer;

// Initialize WebGL context
function initWebGL(canvasId) {
    const canvas = document.getElementById(canvasId);
    gl = canvas.getContext('webgl');
    if (!gl) {
        alert('Unable to initialize WebGL.');
        return;
    }

    // Initialize shaders, program, buffers, etc.
    initShaders();
    initBuffers();
}

// Shader source code (vertex and fragment shaders)
const vertexShaderSource = `...`;
const fragmentShaderSource = `...`;

// Functions for shader compilation and program linking
function createShader(type, source) {  ...  }
function createProgram(vertexShader, fragmentShader) {  ...  }

// Initialize shaders and link them into a program
function initShaders() {
    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    program = createProgram(vertexShader, fragmentShader);
}

// Create and bind buffers
function initBuffers() {  ...  }

// Function to transform 2D canvas points to 3D and generate SOR
function transformTo3D(points) {  ...  }
function createSOR(transformedPoints, sides) {  ...  }

// Render function
function render() {  ...  }

// Initialization function
function main() {
    initWebGL('glCanvas');

    // Generate SOR points
    const transformedPoints = transformTo3D(canvasPoints);
    const sorPoints = createSOR(transformedPoints, 10); // Example: 10 sides
    // ... prepare data for WebGL and render
}

// Event listeners and resize handling
window.addEventListener('resize', handleResize);
// ... other interactive components

// Start the application
main();

*/
 
document.addEventListener("DOMContentLoaded", function() {
    // start prog0 existing code ...
    // Accessing the canvas element and its 2D context for drawing
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");

    // Array to store the coordinates of each point clicked by the user
    let points = [];
    // Flag to determine if the polyline drawing is active
    let drawing = true;

    // Function to initialize the canvas with axes
    function initializeCanvas() {
        drawAxes();
    }

    // Function to draw the red horizontal and green vertical axes
    function drawAxes() {
        // Drawing the horizontal axis in red
        ctx.beginPath();
        ctx.strokeStyle = 'red';
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        // Drawing the vertical axis in green
        ctx.beginPath();
        ctx.strokeStyle = 'green';
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
    }

    // Function to draw the polyline based on clicked points
    function drawPolyline() {
        // If no points are clicked, do nothing
        if (points.length === 0) return;

        // Clear the entire canvas to redraw
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw the axes
        drawAxes();

        // Start drawing the polyline
        ctx.beginPath();
        ctx.strokeStyle = 'black'; // Setting the polyline color
        ctx.moveTo(points[0].x, points[0].y); // Move to the first point

        // Iterate over each point and draw line to it
        points.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.stroke(); // Apply the line drawing
    }
    // end prog0 existing code ...

    // Transform 2D points to 3D
    function transformTo3D(points) {
        const maxX = canvas.width, maxY = canvas.height;
        return points.map(p => {
            return {
                x: (p.x / maxX) * 2 - 1,
                y: ((maxY - p.y) / maxY) * 2 - 1,
                z: 0 // Initial z will be 0
            };
        });
    }

    // Generate the SOR by rotating the profile curve
    function createSOR(transformedPoints, sides) {
        let sorPoints = [];
        const angleStep = (2 * Math.PI) / sides;

        for (let i = 0; i < sides; i++) {
            const angle = i * angleStep;
            sorPoints.push(...transformedPoints.map(p => {
                return {
                    x: p.x * Math.cos(angle) - p.y * Math.sin(angle),
                    y: p.x * Math.sin(angle) + p.y * Math.cos(angle),
                    z: p.z
                };
            }));
        }
        return sorPoints;
    }

    // Assuming sorPoints is an array of points {x, y, z}
    // Prepare data for WebGL rendering (example function)
    function prepareSORDataForWebGL(sorPoints) {
        // Convert the SOR points to a format suitable for WebGL
        // This typically involves flattening the points into an array of coordinates
        // Flatten the SOR points array for WebGL
        const vertices = sorPoints.flatMap(p => [p.x, p.y, p.z]);

        // Create and bind the buffer
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

        // Pass the vertex data to the buffer
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // Unbind the buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        return vertexBuffer;
    }

    function render(vertexBuffer, numberOfVertices) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        // Use the program (Assuming you've created a WebGL program already)
        gl.useProgram(program);
    
        // Bind the buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    
        // Get the attribute location, enable it
        const coord = gl.getAttribLocation(program, "coordinates");
        gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(coord);
    
        // Draw the object
        gl.drawArrays(gl.LINE_STRIP, 0, numberOfVertices);
    
        // Clean up
        gl.disableVertexAttribArray(coord);
        gl.useProgram(null);
    }

    function createSOR(transformedPoints, numberOfSides) {
        let sorPoints = [];
        const angleStep = (2 * Math.PI) / numberOfSides;
    
        for (let i = 0; i < numberOfSides; i++) {
            const angle = i * angleStep;
            transformedPoints.forEach(point => {
                sorPoints.push({
                    x: point.x,
                    y: point.y * Math.cos(angle) - point.z * Math.sin(angle),
                    z: point.y * Math.sin(angle) + point.z * Math.cos(angle)
                });
            });
        }
    
        return sorPoints;
    }

    // Left mouse click handler
    // Event listener for mouse clicks to add points to the polyline
    canvas.addEventListener("click", function(event) {
        // If drawing is ended, don't respond to clicks
        if (!drawing) return;

        // Calculate click position relative to canvas
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Add the click position to the points array and redraw the polyline
        points.push({x, y});
        drawPolyline();

        // Log the point coordinates to the console
        console.log("Point added:", {x, y});
    });

    // Right mouse click handler
    // Event listener for right-click to end the drawing process
    // Usage after drawing completion
    canvas.addEventListener("contextmenu", function(event) {
        event.preventDefault(); // Prevent the default right-click menu

        if (drawing) {
            drawing = false;
            console.log("Polyline completed. Final points:", points);

            // Transform, create SOR, and prepare for WebGL
            const transformedPoints = transformTo3D(points);
            const sorPoints = createSOR(transformedPoints, /* specify number of sides here */);
            prepareSORDataForWebGL(sorPoints);

            // Here you would typically call a function to initialize and render with WebGL
            const canvas = document.getElementById("glCanvas");
            const gl = canvas.getContext("webgl");

            if (!gl) {
                alert("Unable to initialize WebGL.");
            }
            // This part is not covered in this snippet but would involve setting up WebGL context, shaders, buffers, etc.
        }
    });

    // Call to initialize the canvas on page load
    initializeCanvas();
});