/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/

/*****************************************************************
 * Bezier Curve Shader
 *****************************************************************/

#extension GL_OES_standard_derivatives : enable

#ifdef GL_ES
precision highp float;
#endif 

uniform vec2 bezierCoord;
uniform vec4 color;

void main(void) {
vec2 px = dFdx(bezierCoord);
vec2 py = dFdy(bezierCoord);
float fx = 2.0 * bezierCoord.x * px.x - px.y;
float fy = 2.0 * bezierCoord.y * py.x - py.y;
float sd = (bezierCoord.x * bezierCoord.x - bezierCoord.y) / sqrt(fx * fx + fy * fy);
gl_FragColor = color * vec4(1,1,1, clamp(0.5 - sd, 0.0, 1.0));
}