// Sample coordinates from prog0 (will need too replace with your actual coordinates)
const prog0Coordinates = [
    { x: 0, y: 0 },
    { x: 100, y: 50 },
    { x: 200, y: 100 },
    // Add more coordinates as needed
];

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

// Print the converted coordinates (you can store them for later use)
console.log("WebGL Coordinates:", webGLCoordinates);