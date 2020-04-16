const ZOOM_FACTOR = 0.1;

class ViewBoard {
    constructor(canvas, ratio=1) {
        this.canvas = canvas;
        this.updateViewport({x: 0.0, y: 0.0}, 1000.0, ratio);
    }
    drawStation(ctx, station) {
        [station.projX, station.projY] = forward([station.latitude, station.longitude]);
        station.screenX = station.projX / this.zoom;
        station.screenY = station.projY / this.zoom;
        ctx.fillText(station.name, station.screenX, station.screenY);
    }
    drawMap(ctx) {
        ctx.save();
        ctx.translate(-this.centerX-this.width/2, -this.centerY-this.height/2);
        // ctx.scale(this.zoom, this.zoom);
        for (let [key,value] of Object.entries(vm.stations)) {
            this.drawStation(ctx, value);
        }
        ctx.restore();
    }
    draw() {
        this.updateViewport();
        let ctx = this.canvas.getContext('2d');
        ctx.save();
        ctx.scale(this.ratio, this.ratio);
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.strokeRect(0, 0, this.width, this.height);
        ctx.font = "12px serif";
        ctx.fillText("x: "+this.centerX+" y: "+this.centerY, 80, 80);
        // ctx.fillText("right_x: " + this.right_x + "bottom_y: " + this.bottom_y, 80, 90);
        ctx.fillText("width: "+this.width+" height: "+this.height, 80, 100);
        ctx.fillText("zoom: " + this.zoom, 80, 110);
        if (vm) {
            this.drawMap(ctx);
        }
        ctx.restore();
    }
    updateViewport(center, zoom, ratio) {
        if (center) {
            this.centerX = center.x;
            this.centerY = center.y;
        }
        if (zoom) {
            this.zoom = zoom;
        }
        if (ratio) {
            this.ratio = ratio;
        }
        this.width = this.canvas.width / this.ratio;
        this.height = this.canvas.height / this.ratio;
        // this.right_x = this.left_x + this.width * this.zoom;
        // this.bottom_y = this.top_y + this.height * this.zoom;
    }
    zoomIn(cursor) {
        console.log('zoom-in');
        // let oldzoom = this.zoom;
        // let newzoom = this.zoom *= 1-ZOOM_FACTOR;
        // this.left_x = this.left_x * newzoom / oldzoom;
        // this.top_y = this.top_y * newzoom / oldzoom;
        // let r = oldzoom / newzoom - 1;
        // let r = ZOOM_FACTOR;
        // this.centerX += this.centerX * r * 1.5;
        // this.centerY += this.centerY * r * 1.5;
        this.centerY += this.centerY * 0.1;
        this.updateViewport(null, this.zoom *= 1-ZOOM_FACTOR);
    }
    zoomOut(cursor) {
        console.log('zoom-out');
        // let oldzoom = this.zoom;
        // let newzoom = this.zoom *= 1+ZOOM_FACTOR;
        // this.centerX -= this.centerX * ZOOM_FACTOR * 1;
        // this.centerY -= this.centerY * ZOOM_FACTOR * 1;
        // this.left_x = this.left_x * oldzoom / newzoom;
        // this.top_y = this.top_y * oldzoom / newzoom;
        this.centerY -= this.centerY * 0.1;
        this.centerY -= this.height * 0.1 / 2;
        this.updateViewport(null, this.zoom *= 1+ZOOM_FACTOR);
    }
}