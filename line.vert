
attribute vec2 a_position;
uniform vec2 u_resolution;
uniform vec2 u_translation;
uniform float u_scale;
void main() {
    vec2 scale = a_position / u_scale;
    vec2 translate = scale + u_translation;
    vec2 zeroToOne = translate / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}