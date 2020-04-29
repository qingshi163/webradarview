attribute vec2 a_offset;
uniform vec2 u_position;
uniform vec2 u_resolution;
uniform vec2 u_translation;
uniform float u_scale;
void main() {
    // vec2 scale = u_position / u_scale;
    // vec2 offset = scale + a_offset;
    //vec2 translate = scale + u_translation;//offset + u_translation;
    vec2 position = u_position / u_scale;
    vec2 a = a_offset + position + u_translation;
    vec2 zeroToOne = a / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}