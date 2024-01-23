// Sample coordinates from prog0 (replace with your actual coordinates)
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

// Print the rotated profile (you can store it for further processing)
console.log(`Rotated Profile (to ${chosenPlane}-plane):`, rotatedProfile);