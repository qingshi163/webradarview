// const firstProjection = 'WGS84';
const secondProjection = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs';
//'+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
//'+proj=merc +units=m'
//'+proj=utm +zone=1 +units=m';
//+proj=merc +lat_ts=0 +lon_0=0 +k=1.000000 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs no_defs
var projector = proj4(secondProjection);

function forward(p) {
    return projector.forward(p)
}
function inverse(p) {
    return projector.inverse(p)
}

// function forward(p) {
//     let x = p.x * 20037508.34 / 180;
//     let y = Math.log(Math.tan((90 + p.y) * Math.PI / 360)) / (Math.PI / 180);
//     y = y * 20037508.34 / 180;
//     return [x, y];
// }