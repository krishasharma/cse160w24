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

// Function to generate the Surface of Revolution (SOR)
function generateSOR(profile, sides) {
    const sorVertices = [];
    const sorPolygons = [];

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
    }

    return { vertices: sorVertices, polygons: sorPolygons };
}

// Number of sides for the SOR (e.g., 3 for triangular cross-section)
const sides = 3;

// Generate the Surface of Revolution (SOR) using the rotated profile and number of sides
const sorObject = generateSOR(rotatedProfile, sides);

// Variable to store user input for sides and end caps (true for end caps, false for no end caps)
let userSides = 3; // Default number of sides
let drawEndCaps = true; // Default to draw end caps

// Function to handle user input
function handleUserInput() {
    userSides = parseInt(prompt("Enter the number of sides for the cross-section (e.g., 3 for triangular):"));
    drawEndCaps = confirm("Draw end caps? (OK for yes, Cancel for no)");

    // Validate user input for sides (must be a positive integer)
    if (isNaN(userSides) || userSides <= 0) {
        alert("Invalid input for sides. Using default value.");
        userSides = 3; // Default value
    }

    // Display user choices
    console.log(`User Choices - Sides: ${userSides}, Draw End Caps: ${drawEndCaps}`);
}

// Call the function to handle user input
handleUserInput();

// Generate the Surface of Revolution (SOR) using user-defined sides and end caps choice
const userSorObject = generateSOR(rotatedProfile, userSides);

// Print the SOR vertices and polygons (can store them for later use)
console.log("SOR Vertices:", sorObject.vertices);
console.log("SOR Polygons:", sorObject.polygons);
// Print the rotated profile (can store it for further processing)
console.log(`Rotated Profile (to ${chosenPlane}-plane):`, rotatedProfile);
