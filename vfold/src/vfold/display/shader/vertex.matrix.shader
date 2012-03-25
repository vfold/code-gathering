/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/

/*****************************************************************
 * Matrix positioning Vertex Shader
 * Multiply the position by the matrix
 *****************************************************************/
attribute vec2 position;
/*****************************************************************
 * TX , TY , 
 * SX , SY , -
 * RT , -  , -
 *****************************************************************/
uniform mat3 transformation;
/*****************************************************************
 * Viewport Width , Height
 *****************************************************************/
uniform vec2 projection;

void main() {

	/*****************************************************************
	 * Convert Degrees to Radians: angleInDegrees * PI /180 
	 * Calculate Angles
	 *****************************************************************/
	float angleInRadians = radians(transformation[2][0]);
	float c = cos(angleInRadians);
	float s = sin(angleInRadians);
	/*****************************************************************
	 * Declare matrices
	 *****************************************************************/
	mat3 rotation = mat3(c, -s, 0, s, c, 0, 0, 0, 1);
	mat3 scale = mat3(transformation[1][0], 0, 0, 0,transformation[1][1], 0, 0, 0, 1);
	mat3 translation = mat3(1, 0, 0, 0, 1, 0, transformation[0][0], transformation[0][1], 1);
	mat3 projection = mat3(projection.x*0.5, 0, 0, 0,projection.y*0.5, 0, -1, 1, 1);
	/*****************************************************************
	 * Multiply the matrices
	 *****************************************************************/
	gl_Position = vec4((scale * rotation * translation * projection * vec3(position, 1)).xy, 0, 1);
}