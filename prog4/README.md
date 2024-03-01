# 3D WebGL Lighting and Shading Demo

## Overview

Understand and implement various lighting and shading techniques in WebGL.

## Implementation Details and Features

### Smooth Shading

- **Gouraud Shading:** Perform lighting calculations per vertex. Interpolate these colors across the polygon in the fragment shader.
- **Phong Shading:** Interpolate vertex normals across the polygon and perform lighting calculations for each point within the polygon in the fragment shader.

### Lighting Effects

- **Ambient Lighting:** Add a constant lighting term to simulate indirect light.
- **Specular Lighting:** Implement highlights by considering the viewer's position relative to the light source and the surface.

### Light Sources

- **Directional Light:** Implement a toggle to turn this light source on and off.
- **Point Light:** Position at `(-100,100,100)` with an orange color `(1.0, 0.8, 0.2)`. Implement a toggle for this light source and allow the user to move it.

## Usage

1. Open the `driver.html` file in a modern web browser.
2. Use the sliders and togles to adjust the necessary elements of the rendering. 

## Development

This project was developed using pure WebGL and JavaScript without relying on external 3D libraries.

## Author

- **Name:** Krisha Sharma
- **Date:** 01.30.24