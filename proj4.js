const firstProjection = 'WGS84';
const secondProjection = '+proj=utm +zone=11 +units=m';
var projector = proj4(firstProjection, secondProjection);

function forward(p) {
    return projector.forward(p)
}
function inverse(p) {
    return projector.inverse(p)
}