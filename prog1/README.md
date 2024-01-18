# CSE 160: Computer Graphics 
# Program 1 

# General Discription given for Assignment
For this assignment, we will creating surface of revolutions (SOR) and drawing their "skeleton", referred to as wireframes.
You will use the output from prog0 as the profile curve for generating the SOR. The SOR will have a unit height along the z-axis from z=0 to z=1. The z=0 plane is the screen i.e. you'll be looking straight down at the top of your SOR. Note that this is different from the canvas coordinates in prog0.
The coordinates of the profile curve from prog0 will need to changed. First, rescale the min/max canvas x-values to [0..1]. We shall treat these canvas x-values as our SOR z-value. Next, rescale the min/max canvas y-values to [0..1], but with y-axis pointing up. That is, you'll need to change the sign of y. Now that we have the rescaled z and y coordinates of the profile curve. rotate it around the z axis to generate xyz coordinates of the SOR. These points will have the range of [-1..1][-1..1][0..1]. That is, your SOR object will be contained within a 2x2x1 block.
As the name implies, SORs are defined by a profile (a polyline) that is rotated around an axis of revolution. A simple example of an SOR is a cylinder. Its profile is simply a straight line. As the line is rotated 360 degrees, a cylinder is formed.
Depending on how "smoothly" or "slowly" one rotates the profile, an SOR will have differently shaped cross sections. The simplest is a triangular cross section with 3 sides. In general, you should be able to create an n-sided cross sectional SOR by specifying n. In essence, theta = 360/n, where theta is the angular increment for each rotation step.
You should also create the end caps for the SORs that you build although the user will be able to specify whether the end caps will be drawn or not.
Each end cap is created by placing a center point on each end, and triangulating from each vertex.
For this assignment, allow the user to specify: (a) n, and (b) boolean to specify whether to draw the end caps (true) or not (false). Note that while the object that you create is 3D, the rendering for this assignment will look appear 2D (see figures). You do need to output counts for (1) the number of points, and (2) the total number of polygons (triangles) including both end caps.
Represent your SOR using a simplified OBJ format (see Chap 10). Note that you will be using this format for the remaining assignments. The geometry of each object is stored in two files. The first file: objname.coor stores the x,y,z coordinates of each point, while the second file: objname.poly stores the faces or polygons making up the object. We will assume that all polygons are triangular i.e. you need to triangulate all the polygons. For example, a rectangle is represented by 2 triangles sharing a side. Here is an example of a rectangular polygon using this format.

# Files Given
features.html

# Known Errors 
There are currently no known errors in this implementation

# User Guide 