const ZOOM_FACTOR = 0.1;

class ViewBoard {
    constructor(canvas, ratio=1) {
        this.canvas = canvas;
        this.updateViewport({x: 0.0, y: 0.0}, 1000.0, ratio);
    }
    drawStation(ctx, station) {
        if (station.projX == undefined || station.projY == undefined) {
            [station.projX, station.projY] = forward([station.lat, station.lon]);
        }
        station.screenX = station.projX / this.zoom;
        station.screenY = station.projY / this.zoom;
        ctx.fillText(station.name, station.screenX, station.screenY);
    }
    drawMap(ctx) {
        ctx.save();
        ctx.translate(-this.centerX + this.width / 2, -this.centerY + this.height / 2);
        // ctx.scale(this.zoom, this.zoom);
        for (let [key,value] of Object.entries(vm.fixes)) {
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
    }
    zoomIn() {
        console.log('zoom-in');
        let newzoom = this.zoom * (1 - ZOOM_FACTOR);
        let newx = this.centerX * (1 + (this.zoom - newzoom) / newzoom);
        let newy = this.centerY * (1 + (this.zoom - newzoom) / newzoom);
        this.updateViewport({x: newx, y: newy }, newzoom);
    }
    zoomOut() {
        console.log('zoom-out');
        let newzoom = this.zoom * (1 + ZOOM_FACTOR);
        let newx = this.centerX * (1 + (this.zoom - newzoom) / newzoom);
        let newy = this.centerY * (1 + (this.zoom - newzoom) / newzoom);
        this.updateViewport({x: newx, y: newy }, newzoom);
    }
}