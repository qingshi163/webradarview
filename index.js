var vm = null;
var vb = null;
var g_settings;

const SETTING = {
    STRING: 1,
    FONT: 2,
    TEXT_ALIGN: 3,
    TEXT_BASELINE: 4,
    STYLE: 5,
}

window.onload = function() {
    g_settings = {
        parent: null
    };

    initCanvas();

    document.getElementById('load-file').addEventListener('change', on_load_file);

    // let app = new Vue({
    //     el: '#app',
    //     data: {
    //         message: 'Hello Vue!!'
    //     }
    // });

    // fetch('res/ZBPE FIR VATPRC/Data/Sectors/ZBPE.sct').then((res) => {
    //     return res.text();
    // }).then((data) => {
    //     let parser = new SectorParser(data);
    //     setup_vm(parser.model);
    // });
}

function initCanvas() {
    const layer1 = document.getElementById('layer1');
    const layer2 = document.getElementById('layer2');
    const ratio = window.devicePixelRatio || 1;
    vb = new ViewBoardWebGL(layer1, layer2,  g_settings, ratio);

    function resizeCanvas() {
        layer1.width = window.innerWidth * ratio;
        layer1.height = window.innerHeight * ratio;
        layer1.style.width = window.innerWidth + 'px';
        layer1.style.height = window.innerHeight + 'px';
        layer2.width = window.innerWidth * ratio;
        layer2.height = window.innerHeight * ratio;
        layer2.style.width = window.innerWidth + 'px';
        layer2.style.height = window.innerHeight + 'px';
        vb.updateViewport();
        vb.draw();
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let dragX, dragY, originX, originY;
    let draging = false;
    layer2.addEventListener('mousedown', function() {
        dragX = 0.0;
        dragY = 0.0;
        originX = vb.centerX;
        originY = vb.centerY;
        draging = true;
    });
    layer2.addEventListener('mouseup', function() {
        draging = false;
    });
    layer2.addEventListener('mousemove', function(event) {
        if (draging) {
            dragX -= event.movementX;
            dragY -= event.movementY;
            vb.updateViewport({x: originX + dragX, y: originY + dragY});
            // vb.updateViewport({x: originX + dragX * ratio, y: originY + dragY * ratio});
            vb.draw();
        }
    });
    layer2.addEventListener('wheel', function(event) {
        if (event.deltaY < 0) {
            vb.zoomIn();
        } else {
            vb.zoomOut();
        }
        vb.draw();
    });
    layer2.addEventListener('contextmenu', function(event) {
        event.preventDefault();
        return false;
    });
}

function proj(s) {
    [s.projX, s.projY] = forward([s.lon, s.lat]);
    s.projY = -s.projY;
}
function proj2(s) {
    [s.projX1, s.projY1] = forward([s.lon1, s.lat1]);
    s.projY1 = -s.projY1;
    [s.projX2, s.projY2] = forward([s.lon2, s.lat2]);
    s.projY2 = -s.projY2;
}

function transColor(s, sub) {
    sub = sub || s;
    s.rgba = sub.color.match(/\w\w/g).slice(0, 4).map(x => parseInt(x, 16) / 255.0);
    for (let i = s.rgba.length; i < 4; i++) {
        s.rgba.push(1.0);
    }
}

function setup_vm(_vm) {
    vm = _vm;
    if (!vm) return;
    Object.values(vm.vor).forEach(x => proj(x));
    Object.values(vm.ndb).forEach(x => proj(x));
    Object.values(vm.fixes).forEach(x => proj(x));
    Object.values(vm.airport).forEach(x => proj(x));
    Object.values(vm.runway).forEach(x => proj2(x));
    Object.values(vm.sid).forEach(x => proj2(x));
    Object.values(vm.star).forEach(x => proj2(x));
    Object.values(vm.highAirway).forEach(x => proj2(x));
    Object.values(vm.lowAirway).forEach(x => proj2(x));
    Object.values(vm.artcc).forEach(x => proj2(x));
    Object.values(vm.artccLow).forEach(x => proj2(x));
    Object.values(vm.artccHigh).forEach(x => proj2(x));
    Object.values(vm.geo).forEach(geo => {transColor(geo, geo[0]);geo.forEach(x => proj2(x))});
    Object.values(vm.regions).forEach(region => {transColor(region);region.forEach(x => proj(x))});
    Object.values(vm.labels).forEach(x => proj(x));
    vm.vor.CENTER00 = { name: 'CENTER00', freq: 0.0, lat: 0, lon: 0, projX: 0, projY: 0 };
    vm.highAirway.push({
        name: 'LEFT-RIGHT',
        lat1: 0,
        lon1: 0,
        lat2: 0,
        lon2: 0,
        projX1: 0,
        projY1: 0,
        projX2: 100000,
        projY2: 0,
    });
    vm.highAirway.push({
        name: 'RIGHT-LEFT',
        lat1: 0,
        lon1: 0,
        lat2: 0,
        lon2: 0,
        projX1: 100000,
        projY1: 10000,
        projX2: 0,
        projY2: 10000,
    });

    // vb.model = vm;
    vb.setupModel(vm);
    vb.draw();
}

function on_load_file(event) {
    if (event.target.files.length != 0) {
        let file = event.target.files[0];
        let reader = new FileReader();
        reader.onload = (evt) => {
            console.log('File Load Success: ' + file.name);
            let parser = new SectorParser(evt.target.result);
            setup_vm(parser.model);
        };
        reader.readAsText(file);
    } else {
        setup_vm(null);
    }
}