// Prog2 based on: LightedCube.js (c) 2012 Matsuda & Lea 
// Prog3 based on: Hall of Fame code given from Marcus Williamson

// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +        // Normal
  'uniform mat4 u_ViewMatrix;\n' +      // View matrix
  'uniform mat4 u_ProjMatrix;\n' +      // Projection matrix
  'varying vec3 v_Normal;\n' +          // For passing normal to fragment shader
  'varying vec3 v_Position;\n' +        // For passing position to fragment shader
  'varying vec4 v_Color;\n' +           // For passing color to fragment shader
  'void main() {\n' +
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * a_Position;\n' +
  '  v_Position = vec3(u_ViewMatrix * a_Position);\n' +
  '  v_Normal = normalize(vec3(u_ViewMatrix * vec4(a_Normal.xyz, 0.0)));\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform vec3 u_ViewPosition;\n' +     // Camera/view position
  'uniform vec3 u_LightColor;\n' +       // Light color
  'uniform vec3 u_LightDirection;\n' +   // Directional light direction
  'uniform vec3 u_PointLightColor;\n' +  // Point light color
  'uniform vec3 u_PointLightPosition;\n' + // Point light position
  'uniform vec3 u_AmbientLight;\n' +     // Ambient light color
  'uniform float u_Shininess;\n' +       // Shininess factor for specular light
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Normal;\n' +           // Normal received from vertex shader
  'varying vec3 v_Position;\n' +         // Position received from vertex shader
  'void main() {\n' +
  '  vec3 normal = normalize(v_Normal);\n' +
  '  vec3 lightDirection = normalize(u_PointLightPosition - v_Position);\n' +
  '  vec3 viewDir = normalize(u_ViewPosition - v_Position);\n' +

  // Ambient light calculation
  '  vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +

  // Diffuse light calculation
  '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
  '  vec3 diffuse = u_PointLightColor * v_Color.rgb * nDotL;\n' +

  // Specular light calculation
  '  vec3 reflectDir = reflect(-lightDirection, normal);\n' +
  '  float spec = pow(max(dot(viewDir, reflectDir), 0.0), u_Shininess);\n' +
  '  vec3 specular = u_LightColor * spec;\n' +

  // Combine all components and output the final color
  '  vec3 finalColor = ambient + diffuse + specular;\n' +
  '  gl_FragColor = vec4(finalColor, v_Color.a);\n' +
  '}\n';

// Directional light
var directionalLightColor = [1.0, 1.0, 1.0]; // White light
var lightDirection = [1.0, 1.0, 1.0]; // Direction of the light

// Point light
var pointLightColor = [1.0, 0.8, 0.2]; // Warm orange light
var pointLightPosition = [-100.0, 100.0, 100.0]; // Point light position

// Camera parameters
var camPosX = 0, camPosY = 0, camPosZ = 5;
var camLookAtX = 0, camLookAtY = 0, camLookAtZ = 0;
var fov = 60
var usePerspective = false;

// Camera waypoints
var waypoints = [
  { position: [0, 0, 5], lookAt: [0, 0, 0] }, // Starting position
  { position: [5, 5, 5], lookAt: [1, 1, 0] },
  { position: [-5, 5, 5], lookAt: [-1, 1, 0] },
  { position: [-5, -5, 5], lookAt: [-1, -1, 0] },
  { position: [5, -5, 5], lookAt: [1, -1, 0] },
  { position: [0, 0, 5], lookAt: [0, 0, 0] }  // Returning to start
];
var currentWaypointIndex = 0;
var animationProgress = 0; // Progress between 0 and 1
var animationSpeed = 0.01; // Adjust for faster or slower animation

document.getElementById('pointLightX').value = pointLightPosition[0];
document.getElementById('pointLightY').value = pointLightPosition[1];
document.getElementById('pointLightZ').value = pointLightPosition[2];

const maxScale = 2;
const maxMove = [3, 3, 3];

let wireframe = false;
let scaleAmount = 1;
let moveAmount = new Float32Array([-1.0, 0.0, 0.0]);  // x, y, z
let rotation = [0, 0, 0];

let wireframe2 = false;
let scaleAmount2 = 0.5;
let moveAmount2 = new Float32Array([1.0, 0.0, 0.0]);  // x, y, z
let rotation2 = [0, 0, 0];
let useFlatShading = true; // Default to flat shading
let useGouraudShading = false;
let usePhongShading = false;
let useAmbientLight = true;
let useDiffuseLight = true;
let useSpecularLight = true;

document.getElementById('togglePerspective').addEventListener('change', function() {
  usePerspective = this.checked;
  main(); // Re-render the scene
});

document.getElementById("wireframe").addEventListener("change", function() {
    wireframe = this.checked;
    main();
});

document.getElementById("toggleDirectionalLight").addEventListener("change", function() {
  directionalLightColor = this.checked ? [1.0, 1.0, 1.0] : [0.0, 0.0, 0.0];
  main();
});

document.getElementById("togglePointLight").addEventListener("change", function() {
  pointLightColor = this.checked ? [1.0, 0.8, 0.2] : [0.0, 0.0, 0.0];
  main();
});

document.getElementById("gouraudShading").addEventListener("change", function() {
  useGouraudShading = this.checked;
  if (this.checked) {
      document.getElementById("phongShading").checked = false;
      usePhongShading = false;
  }
  main();
});

document.getElementById("phongShading").addEventListener("change", function() {
  usePhongShading = this.checked;
  if (this.checked) {
      document.getElementById("gouraudShading").checked = false;
      useGouraudShading = false;
  }
  main();
});

document.getElementById("ambientLight").addEventListener("change", function() {
  useAmbientLight = this.checked;
  main();
});

document.getElementById("diffuseLight").addEventListener("change", function() {
  useDiffuseLight = this.checked;
  main();
});

document.getElementById("specularLight").addEventListener("change", function() {
  useSpecularLight = this.checked;
  main();
});

document.getElementById('camPosX').addEventListener('input', function() {
  camPosX = parseFloat(this.value);
  main(); // Re-render the scene
});

document.getElementById('camPosY').addEventListener('input', function() {
  camPosY = parseFloat(this.value);
  main(); // Re-render the scene
});

document.getElementById('camPosZ').addEventListener('input', function() {
  camPosZ = parseFloat(this.value);
  main(); // Re-render the scene
});

document.getElementById('camLookAtX').addEventListener('input', function() {
  camLookAtX = parseFloat(this.value);
  main(); // Re-render the scene
});

document.getElementById('camLookAtY').addEventListener('input', function() {
  camLookAtY = parseFloat(this.value);
  main(); // Re-render the scene
});

document.getElementById('camLookAtZ').addEventListener('input', function() {
  camLookAtZ = parseFloat(this.value);
  main(); // Re-render the scene
});

document.getElementById('fov').addEventListener('input', function() {
  fov = parseFloat(this.value);
  main(); // Re-render the scene
});

document.getElementById('pointLightX').addEventListener('input', function() {
  pointLightPosition[0] = parseFloat(this.value);
  main(); // Re-render the scene
});

document.getElementById('pointLightY').addEventListener('input', function() {
  pointLightPosition[1] = parseFloat(this.value);
  main(); // Re-render the scene
});

document.getElementById('pointLightZ').addEventListener('input', function() {
  pointLightPosition[2] = parseFloat(this.value);
  main(); // Re-render the scene
});

document.getElementById("scale").addEventListener("input", function() {
  scaleAmount = this.value / (100 / maxScale);
  main();
});

document.getElementById("moveX").addEventListener("input", function() {
  moveAmount[0] = this.value / (100 / maxMove[0]);
  main();
});

document.getElementById("moveY").addEventListener("input", function() {
  moveAmount[1] = this.value / (100 / maxMove[1]);
  main();
});

document.getElementById("moveZ").addEventListener("input", function() {
  moveAmount[2] = this.value / (100 / maxMove[2]);
  main();
});

document.getElementById("rotationX").addEventListener("input", function() {
  rotation[0] = this.value;
  main();
});

document.getElementById("rotationY").addEventListener("input", function() {
  rotation[1] = this.value;
  main();
});

document.getElementById("rotationZ").addEventListener("input", function() {
  rotation[2] = this.value;
  main();
});

// OBJECT 2 //
document.getElementById("wireframe2").addEventListener("change", function() {
  wireframe2 = this.checked;
  main();
});

document.getElementById("scale2").addEventListener("input", function() {
  scaleAmount2 = this.value / (100 / maxScale);
  main();
});

document.getElementById("moveX2").addEventListener("input", function() {
  moveAmount2[0] = this.value / (100 / maxMove[0]);
  main();
});

document.getElementById("moveY2").addEventListener("input", function() {
  moveAmount2[1] = this.value / (100 / maxMove[1]);
  main();
});

document.getElementById("moveZ2").addEventListener("input", function() {
  moveAmount2[2] = this.value / (100 / maxMove[2]);
  main();
});

document.getElementById("rotationX2").addEventListener("input", function() {
  rotation2[0] = this.value;
  main();
});

document.getElementById("rotationY2").addEventListener("input", function() {
  rotation2[1] = this.value;
  main();
});

document.getElementById("rotationZ2").addEventListener("input", function() {
  rotation2[2] = this.value;
  main();
});

document.getElementById('dirLightColor').addEventListener('input', function() {
  directionalLightColor = hexToRgb(this.value);
  main();  // Redraw scene with new light color
});

document.getElementById('pointLightColor').addEventListener('input', function() {
  pointLightColor = hexToRgb(this.value);
  main();  // Redraw scene with new light color
});

document.getElementById('shininess').addEventListener('input', function() {
  shininess = parseFloat(this.value);
  main();  // Redraw scene with new shininess value
});

document.getElementById('startAnimation').addEventListener('click', function() {
  currentWaypointIndex = 0; // Reset to start
  animationProgress = 0;    // Reset progress
  animateCamera();          // Begin the animation
});

// Retrieve <canvas> element
var canvas = document.getElementById('webgl');

// Get the rendering context for WebGL
var gl = getWebGLContext(canvas);
if (!gl) {
  console.log('Failed to get the rendering context for WebGL');
}

// Initialize shaders
if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
  console.log('Failed to intialize shaders.');
}

// Helper function to convert hex color to RGB
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : null;
}

// Add a toggle function or mechanism
function toggleShading() {
  useFlatShading = !useFlatShading;
  main(); // Re-render the scene with the new shading type
}

function main() {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var vertices = new Float32Array([   // Coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
  ]);


  var colors = new Float32Array([    // Colors
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
 ]);

 var colors2 = new Float32Array([    // Colors
    0, 1, 0,   0, 1, 0,   0, 1, 0,  0, 1, 0,     // v0-v1-v2-v3 front
    0, 1, 0,   0, 1, 0,   0, 1, 0,  0, 1, 0,     // v0-v3-v4-v5 right
    0, 0, 0,   0, 1, 0,   0, 1, 0,  0, 1, 0,     // v0-v5-v6-v1 up
    0, 0, 0,   0, 1, 0,   0, 1, 0,  0, 1, 0,     // v1-v6-v7-v2 left
    0, 0, 0,   0, 1, 0,   0, 1, 0,  0, 1, 0,     // v7-v4-v3-v2 down
    0, 0, 0,   0, 1, 0,   0, 1, 0,  0, 1, 0　    // v4-v7-v6-v5 back
 ]);


  var normals = new Float32Array([    // Normal
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  ]);


  // Indices of the vertices
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
 ]);

  // Set the clear color and enable the depth test
  gl.clearColor(1, 1, 1, 1);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables and so on
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
  // Get the storage locations of the point light variables
  var u_PointLightColor = gl.getUniformLocation(gl.program, 'u_PointLightColor');
  var u_PointLightPosition = gl.getUniformLocation(gl.program, 'u_PointLightPosition');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  var u_ViewPosition = gl.getUniformLocation(gl.program, 'u_ViewPosition');
  var u_Shininess = gl.getUniformLocation(gl.program, 'u_Shininess');
  var u_UseAmbientLight = gl.getUniformLocation(gl.program, 'u_UseAmbientLight');
  var u_UseDiffuseLight = gl.getUniformLocation(gl.program, 'u_UseDiffuseLight');
  var u_UseSpecularLight = gl.getUniformLocation(gl.program, 'u_UseSpecularLight');
  // Get the uniform locations for the view and projection matrices in the shader program
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    


  // Setting the static uniform variables
  // Set the directional light color and direction
  gl.uniform3fv(u_LightColor, directionalLightColor);
  gl.uniform3fv(u_LightDirection, new Vector3(lightDirection).elements);

  // Set the point light color and position
  gl.uniform3fv(u_PointLightColor, pointLightColor);
  gl.uniform3fv(u_PointLightPosition, new Vector3(pointLightPosition).elements);

  // Set the ambient light color (example: soft white light)
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

  // Set the viewer's position (example: the camera's position)
  gl.uniform3f(u_ViewPosition, 0.0, 0.0, 5.0);

  // Set the shininess factor for specular highlights (example: a moderate shine)
  gl.uniform1f(u_Shininess, 32.0);

  // Set the values for the lighting flag uniforms
  gl.uniform1i(u_UseAmbientLight, useAmbientLight ? 1 : 0);
  gl.uniform1i(u_UseDiffuseLight, useDiffuseLight ? 1 : 0);
  gl.uniform1i(u_UseSpecularLight, useSpecularLight ? 1 : 0);

  // Update the point light position uniform
  gl.uniform3fv(u_PointLightPosition, new Float32Array(pointLightPosition));

  if (!u_MvpMatrix || !u_LightColor || !u_LightDirection) { 
    console.log('Failed to get the storage location');
    return;
  }

  // Set the light color (white)
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  // Set the light direction (in the world coordinate)
  var lightDirection = new Vector3([1, 1, 1]);
  lightDirection.normalize();     // Normalize
  gl.uniform3fv(u_LightDirection, lightDirection.elements);

  // Create and set the view matrix based on the current camera position and where it's looking
  var viewMatrix = new Matrix4();
  // setLookAt parameters: eyeX, eyeY, eyeZ, atX, atY, atZ, upX, upY, upZ
  viewMatrix.setLookAt(camPosX, camPosY, camPosZ, camLookAtX, camLookAtY, camLookAtZ, 0, 1, 0);
  // Create and set the projection matrix. This will depend on whether the user has chosen
  // to use a perspective projection or an orthographic projection
  var projMatrix = new Matrix4();
  if (usePerspective) {
      // Set a perspective projection: fov, aspect, near, far
      projMatrix.setPerspective(fov, canvas.width / canvas.height, 1, 100);
  } else {
      // Set an orthographic projection: left, right, bottom, top, near, far
      projMatrix.setOrtho(-1, 1, -1, 1, 0.1, 100);
  }
  // Pass the view and projection matrices to the shader program
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

  /*
  // Calculate the view projection matrix
  var mvpMatrix = new Matrix4();    // Model view projection matrix
  mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  mvpMatrix.lookAt(0, 0, 10, 0, 0, 0, 0, 1, 0);
  // Pass the model view projection matrix to the variable u_MvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  */

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Calculate both flat and smooth normals
  let flatNormals1 = calculateFlatNormalsIndexed(vertices, indices);
  let smoothNormals1 = calculateSmoothNormalsIndexed(vertices, indices);
  
  let normals1, normals2;
  if (useGouraudShading || usePhongShading) {
      // For Gouraud or Phong shading, use smooth normals
      normals1 = smoothNormals1;
      normals2 = calculateSmoothNormalsIndexed(vertices, indices); // For Object 2
  } else {
      // Default to flat shading
      normals1 = flatNormals1;
      normals2 = calculateFlatNormalsIndexed(vertices, indices); // For Object 2
  }

  // Rotate points if needed
  let rotatedVertices1 = rotatePoints(rotation, vertices);
  let rotatedVertices2 = rotatePoints(rotation2, vertices);

  // Apply transformations to vertices
  let transformedVertices1 = scalePoints(scaleAmount, rotatedVertices1);
  transformedVertices1 = translatePoints(moveAmount, transformedVertices1);
  
  let transformedVertices2 = scalePoints(scaleAmount2, rotatedVertices2);
  transformedVertices2 = translatePoints(moveAmount2, transformedVertices2);

  // Draw objects with the appropriate normals
  drawObj(transformedVertices1, colors, normals1, indices, wireframe);
  drawObj(transformedVertices2, colors2, normals2, indices, wireframe2);

  setupClickTracking();
}

function calculateFlatNormalsIndexed(vertices, indices) {
  let normals = [];

  for (let i = 0; i < indices.length; i += 3) {
      // Get the indices of the vertices that make up this triangle
      let idx0 = indices[i] * 3;
      let idx1 = indices[i + 1] * 3;
      let idx2 = indices[i + 2] * 3;

      // Extract the three vertices
      let v0 = {x: vertices[idx0], y: vertices[idx0 + 1], z: vertices[idx0 + 2]};
      let v1 = {x: vertices[idx1], y: vertices[idx1 + 1], z: vertices[idx1 + 2]};
      let v2 = {x: vertices[idx2], y: vertices[idx2 + 1], z: vertices[idx2 + 2]};

      // Calculate two edges from the three vertices
      let edge1 = {x: v1.x - v0.x, y: v1.y - v0.y, z: v1.z - v0.z};
      let edge2 = {x: v2.x - v0.x, y: v2.y - v0.y, z: v2.z - v0.z};

      // Cross product to get the normal
      let nx = edge1.y * edge2.z - edge1.z * edge2.y;
      let ny = edge1.z * edge2.x - edge1.x * edge2.z;
      let nz = edge1.x * edge2.y - edge1.y * edge2.x;

      // Normalize the normal
      let length = Math.sqrt(nx * nx + ny * ny + nz * nz);
      nx /= length;
      ny /= length;
      nz /= length;

      // Add the normal for each vertex of the triangle
      for (let j = 0; j < 3; j++) {
          normals.push(nx, ny, nz);
      }
  }

  return new Float32Array(normals);
}

function calculateSmoothNormalsIndexed(vertices, indices) {
  let normals = new Array(vertices.length).fill(0); // Initialize normals array
  normals = normals.map(() => new Vector3([0, 0, 0])); // Each normal is a Vector3

  // Iterate over each face (triangle) using indices
  for (let i = 0; i < indices.length; i += 3) {
      // Get the vertices of the triangle
      let v1 = new Vector3([
          vertices[indices[i] * 3], vertices[indices[i] * 3 + 1], vertices[indices[i] * 3 + 2]
      ]);
      let v2 = new Vector3([
          vertices[indices[i + 1] * 3], vertices[indices[i + 1] * 3 + 1], vertices[indices[i + 1] * 3 + 2]
      ]);
      let v3 = new Vector3([
          vertices[indices[i + 2] * 3], vertices[indices[i + 2] * 3 + 1], vertices[indices[i + 2] * 3 + 2]
      ]);

      // Calculate normal for this face (cross product)
      let edge1 = new Vector3(v2.elements).subtract(v1);
      let edge2 = new Vector3(v3.elements).subtract(v1);
      let faceNormal = new Vector3(edge1.elements).cross(edge2).normalize();

      // Add this normal to the normals of all three vertices
      normals[indices[i]].add(faceNormal);
      normals[indices[i + 1]].add(faceNormal);
      normals[indices[i + 2]].add(faceNormal);
  }

  // Normalize all normals
  for (let i = 0; i < normals.length; i++) {
      normals[i].normalize();
  }

  // Flatten the normals array for WebGL
  let flattenedNormals = [];
  for (let i = 0; i < normals.length; i++) {
      flattenedNormals.push(normals[i].elements[0], normals[i].elements[1], normals[i].elements[2]);
  }

  return new Float32Array(flattenedNormals);
}

function setupClickTracking() {
  let clickCount = 0;
  document.addEventListener('click', function(event) {
      if (!document.getElementById('webgl').contains(event.target)) {
          clickCount++;
          document.getElementById('outsideClicksCounter').textContent = `Outside Clicks: ${clickCount}`;
      }
  });
}

function drawObj(vertices, colors, normals, indices, wireframe) {
  // Set the vertex coordinates, the color and the normal
  var n = initVertexBuffers(gl, vertices, colors, normals, indices);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  if (wireframe) {
    gl.drawElements(gl.LINE_LOOP, n, gl.UNSIGNED_BYTE, 0);   // Draw the cube (wireframe)
  } else {
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   // Draw the cube
  }
}

function initVertexBuffers(gl, vertices, colors, normals, indices) {
  // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer (gl, attribute, data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return true;
}

// Multiply matrix by scalar
function scalePoints(s, points) {
  let scaledPoints = points.map((x) => x * s);
  return scaledPoints;
}

function translatePoints(moveAmount, points) {
  let translatedPoints = new Float32Array(points.length);
  for (let i = 0; i < points.length; i++) {
    let newPoint = points[i] + moveAmount[i % 3];
    translatedPoints[i] = newPoint;
  }
  return translatedPoints;
}

// Creates rotation matrix, multiplies it by each point vector
function rotatePoints(angle, points) {
  let rotationMatrix = new Matrix4();
  rotationMatrix.setRotate(angle[0], 1, 0, 0);  // x rotation
  rotationMatrix.rotate(angle[1], 0, 1, 0);  // y rotation
  rotationMatrix.rotate(angle[2], 0, 0, 1);  // z rotation
  let rotMatrix = rotationMatrix.elements;

  let rotatedPoints = new Float32Array(points.length);
  for (let i = 0; i < points.length; i += 3) {
    rotatedPoints[i] = rotMatrix[0] * points[i] + + rotMatrix[1] * points[i+1] + rotMatrix[2] * points[i+2];  // x
    rotatedPoints[i+1] = rotMatrix[4] * points[i] + rotMatrix[5] * points[i+1] + rotMatrix[6] * points[i+2];  // y
    rotatedPoints[i+2] = rotMatrix[8] * points[i] + rotMatrix[9] * points[i+1] + rotMatrix[10] * points[i+2];  // z
  }
  return rotatedPoints;
}

function lerp(start, end, t) {
  return (1 - t) * start + t * end;
}

function animateCamera() {
  // Check if we have more waypoints to go through
  if (currentWaypointIndex < waypoints.length - 1) {
      var currentWaypoint = waypoints[currentWaypointIndex];
      var nextWaypoint = waypoints[currentWaypointIndex + 1];

      // Interpolate position and lookAt for each component (x, y, z)
      camPosX = lerp(currentWaypoint.position[0], nextWaypoint.position[0], animationProgress);
      camPosY = lerp(currentWaypoint.position[1], nextWaypoint.position[1], animationProgress);
      camPosZ = lerp(currentWaypoint.position[2], nextWaypoint.position[2], animationProgress);
      camLookAtX = lerp(currentWaypoint.lookAt[0], nextWaypoint.lookAt[0], animationProgress);
      camLookAtY = lerp(currentWaypoint.lookAt[1], nextWaypoint.lookAt[1], animationProgress);
      camLookAtZ = lerp(currentWaypoint.lookAt[2], nextWaypoint.lookAt[2], animationProgress);

      // Increment the progress and loop or move to next waypoint
      animationProgress += animationSpeed;
      if (animationProgress >= 1) {
          currentWaypointIndex++;
          animationProgress = 0;
      }

      requestAnimationFrame(animateCamera); // Continue the animation loop
  }
  main(); // Re-render the scene with the updated camera position
}