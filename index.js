var vm = null;
var vb = null;

function init() {
    vb = new ViewBoard(document.getElementById('viewboard'));
    initCanvas();
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
    ctx.scale(ratio, ratio);

    function resizeCanvas() {
        canvas.width = window.innerWidth * ratio;
        canvas.height = window.innerHeight * ratio;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        vb.draw();
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let drag_x;
    let drag_y;
    let draging = false;
    canvas.addEventListener('mousedown', (event) => {
        drag_x = 0;
        drag_y = 0;
        draging = true;
    });
    canvas.addEventListener('mouseup', (event) => {
        draging = false;
        vb.topleft.x += drag_x;
        vb.topleft.y += drag_y;
        vb.draw();
    });
    canvas.addEventListener('mousemove', (event) => {
        if (draging) {
            drag_x -= event.movementX;
            drag_y -= event.movementY;
        }
    });
    canvas.addEventListener('wheel', (event) => {
        vb.zoom += event.deltaY / 100;
        vb.draw();
    });
}