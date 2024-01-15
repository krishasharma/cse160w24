// Event listener for DOMContentLoaded to ensure the script runs after the full page is loaded
document.addEventListener("DOMContentLoaded", function() {
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
    canvas.addEventListener("contextmenu", function(event) {
        event.preventDefault(); // Prevent the default right-click menu
        if (drawing) {
            drawing = false; // Set drawing flag to false to end polyline drawing
            // Log the final set of points to the console
            console.log("Polyline completed. Final points:", points);
        }
    });

    // Call to initialize the canvas on page load
    initializeCanvas();
});