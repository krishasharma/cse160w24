// Contains Web GL code for prog0 CSE 160/L
// Ensures that the JavaScript code runs only after the HTML document has been fully loaded
document.addEventListener("DOMContentLoaded", function(){
    // Retrieves the canvas element by its ID for manipulation
    var canvas = document.getElementById("drawingCanvas");

    // 'getContext' method gets the rendering context and its drawing functions; '2d' leads to the creation of a CanvasRenderingContext2D object representing a two-dimensional rendering context
    var ctx = canvas.getContext("2d");

    // An array to store the coordinates of each point in the polyline
    var points = [];

    // Draw Axes Function: Draws the initial horizontal and vertical axes on the canvas
    function drawAxes() {
        // Horizontal Red Axis
        ctx.beginPath(); // Begins a path, or resets the current path
        ctx.strokeStyle = 'red'; // Sets the color, gradient, or pattern used for strokes (lines)
        ctx.moveTo(0, canvas.height / 2); // Moves the path to the specified point without creating a line (starting point for red axis)
        ctx.lineTo(canvas.width, canvas.height / 2); // Adds a new point and creates a line to that point from the last specified point in the canvas
        ctx.stroke(); // Strokes (outlines) the current or given path with the current stroke style

        // Vertical Green Axis
        ctx.beginPath(); 
        ctx.strokeStyle = 'green'; 
        ctx.moveTo(canvas.width / 2, 0); 
        ctx.lineTo(canvas.width / 2, canvas.height); 
        ctx.stroke(); // Execution of the draw 
    }

    // Mouse Click Event Handler for the Canvas
    canvas.addEventListener("mousedown", function(event){
        if (event.button === 0) { // Checks if the left mouse button was clicked
            // Calculating and storing the x and y coordinates relative to the canvas
            var x = event.clientX - canvas.offsetLeft;
            var y = event.clientY - canvas.offsetTop;
            points.push({x: x, y: y}); // Adds the new point to the points array

            // Draws the polyline if there is more than one point
            if (points.length > 1) {
                drawPolyline();
            }
        } else if (event.button === 2) { // Checks if the right mouse button was clicked
            // Logs an error message to indicate the end of the polyline drawing
            console.error('End of polyline');
        }
    });

    // Prevents the default right-click context menu from appearing on the canvas
    canvas.addEventListener("contextmenu", function(event){
        event.preventDefault();
    });

    // Function to Draw the Polyline
    function drawPolyline() {
        // Clears the entire canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Redraws the axes to ensure they are visible after clearing
        drawAxes();

        // Begins the polyline drawing process
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y); // Moves to the starting point of the polyline

        // Loops through the points array and draws lines between consecutive points
        for (var i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y); // Connects the previous point to the current point
        }
        ctx.stroke(); // Strokes the current path with the current stroke style
    }

    // Initial call to draw axes on canvas load
    drawAxes();
});