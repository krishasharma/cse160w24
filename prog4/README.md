# 3D WebGL Lighting and Shading Demo

## Overview

This project explores advanced camera control and perspective projection in WebGL, allowing users to interactively navigate through a virtual world with different views and lighting effects.

## Implementation Details and Features

### Camera Control

- **Navigation:** Users can move the camera, rotate it, and zoom in/out to explore the virtual world.
- **Transformations:** Combines translation, rotation, and scaling to control the camera's position and orientation.
- **World Transformation:** Instead of moving objects, the entire world is transformed relative to the camera's view.

### Perspective Projection

- **Toggle Between Views:** Users can switch between orthographic and perspective views to experience different visual perspectives.
- **Field of View (FOV):** Implements zoom functionality by adjusting the FOV. Smaller FOV results in a larger zoom effect.

### Lighting Effects

- **Specular Highlights:** View-dependent lighting effects that change based on the camera's position relative to light sources and object surfaces.
- **Ambient, Diffuse, and Specular Lighting:** Full implementation of these lighting components for a realistic rendering of the scene.

### Advanced Features

- **Linear and Cubic Interpolation:** Basic linear interpolation for camera movement and advanced cubic curve interpolation for smoother paths and animations.

## Usage

1. Open the `driver.html` file in a modern web browser.
2. Use on-screen controls to navigate the camera, switch between projection modes, and observe lighting changes.
3. Experiment with different camera paths and lighting setups to explore the virtual world.

## Development

Developed using WebGL for rendering, with custom implementations of lighting and camera control logic in JavaScript, without external 3D libraries.

## Author

- **Name:** Krisha Sharma
- **Date:** 03.04.24

