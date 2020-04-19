var vm = null;
var vb = null;

function init() {
    initCanvas();

    document.getElementById('load-file').addEventListener('change', on_load_file);

    let load_panel = document.getElementById('load-panel');
    load_panel.style.display = 'block';

    // fetch('VATCA.sct.json').then((res) => {
    //     return res.json();
    // }).then((data) => {
    //     vm = data;
    // });
}

function initCanvas() {
    const canvas = document.getElementById('viewboard');
    const ctx = canvas.getContext('2d');
    const ratio = (window.devicePixelRatio || 1) / (
        ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio || 1);
    // ctx.scale(ratio, ratio);
    vb = new ViewBoard(document.getElementById('viewboard'), ratio);

    function resizeCanvas() {
        canvas.width = window.innerWidth * ratio;
        canvas.height = window.innerHeight * ratio;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        vb.draw();
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let dragX, dragY, originX, originY;
    let draging = false;
    canvas.addEventListener('mousedown', (event) => {
        dragX = 0.0;
        dragY = 0.0;
        originX = vb.centerX;
        originY = vb.centerY;
        draging = true;
    });
    canvas.addEventListener('mouseup', (event) => {
        draging = false;
    });
    canvas.addEventListener('mousemove', (event) => {
        if (draging) {
            dragX -= event.movementX;
            dragY -= event.movementY;
            vb.updateViewport({x: originX + dragX, y: originY + dragY});
            vb.draw();
        }
    });
    canvas.addEventListener('wheel', (event) => {
        if (event.deltaY < 0) {
            // vb.zoomIn({'x': event.clientX, 'y': event.clientY});
            vb.zoomIn();
        } else {
            vb.zoomOut();
            // vb.zoomOut({'x': event.clientX, 'y': event.clientY});
        }
        vb.draw();
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

function setup_vm(_vm) {
    vm = _vm;
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
    Object.values(vm.geo).forEach(geo => geo.forEach(x => proj2(x)));
    Object.values(vm.regions).forEach(region => region.forEach(x => proj(x)));
    Object.values(vm.labels).forEach(x => proj(x));
    vm.vor.CENTER00 = { name: 'CENTER00', freq: 0.0, lat: 0, lon: 0, projX: 0, projY: 0 };
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