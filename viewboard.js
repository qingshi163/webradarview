const ZOOM_FACTOR = 0.1;

class ViewBoard {
    constructor(canvas, ratio=1) {
        this.canvas = canvas;
        this.updateViewport({x: 0.0, y: 0.0}, 1000.0, ratio);
    }
    translate(ctx, projX, projY) {
        ctx.translate(projX / this.zoom, projY / this.zoom);
    }
    drawVor(ctx, s) {
        ctx.save();
        this.translate(ctx, s.projX, s.projY);
        ctx.font = '12px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(s.name, 0, -10);
        ctx.stroke(new Path2D('M-8 -8 h16 v16 h-16 Z M-4 -8 h8 l4 8 l-4 8 h-8 l-4 -8 Z'));
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }
    drawNdb(ctx, s) {
        ctx.save();
        this.translate(ctx, s.projX, s.projY);
        ctx.font = '12px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(s.name, 0, -10);
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
    }
    drawFixes(ctx, s) {
        ctx.save();
        this.translate(ctx, s.projX, s.projY);
        ctx.font = '9px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.name, 0, 0);
        ctx.restore();
    }
    drawAirport(ctx, s) {
        this.drawFixes(ctx, s);
    }
    drawMap(ctx) {
        ctx.save();
        ctx.translate(-this.centerX + this.width / 2, -this.centerY + this.height / 2);
        Object.values(vm.vor).forEach(x => this.drawVor(ctx, x));
        Object.values(vm.ndb).forEach(x => this.drawNdb(ctx, x));
        Object.values(vm.fixes).forEach(x => this.drawFixes(ctx, x));
        Object.values(vm.airport).forEach(x => this.drawAirport(ctx, x));
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