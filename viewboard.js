const ZOOM_FACTOR = 0.1;

class ViewBoard {
    constructor(canvas, ratio = 1) {
        this.canvas = canvas;
        this.updateViewport({ x: 3000.0, y: -1130.0 }, 4000.0, ratio);
    }
    proj2xy(s) {
        return [
            s.projX / this.zoom,
            s.projY / this.zoom,
        ];
    }
    proj2xy2(s) {
        return [
            s.projX1 / this.zoom,
            s.projY1 / this.zoom,
            s.projX2 / this.zoom,
            s.projY2 / this.zoom,
        ];
    }
    drawVor(ctx) {
        ctx.save();
        ctx.font = '12px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        let vorPath = new Path2D('M-8 -8 h16 v16 h-16 Z M-4 -8 h8 l4 8 l-4 8 h-8 l-4 -8 Z');
        for (let s of Object.values(vm.vor)) {
            ctx.save();
            ctx.translate(...this.proj2xy(s));
            ctx.fillText(s.name, 0, -10);
            ctx.stroke(vorPath);
            ctx.beginPath();
            ctx.arc(0, 0, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    }
    drawNdb(ctx) {
        ctx.save();
        ctx.font = '12px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        for (let s of Object.values(vm.ndb)) {
            let [x, y] = this.proj2xy(s);
            ctx.fillText(s.name, x, y - 10);
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.stroke();
        }
        ctx.restore();
    }
    drawFixes(ctx) {
        ctx.save();
        ctx.font = '9px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let s of Object.values(vm.fixes)) {
            ctx.fillText(s.name, ...this.proj2xy(s));
        }
        ctx.restore();
    }
    drawLabels(ctx) {
        ctx.save();
        ctx.font = '8px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let s of vm.labels) {
            ctx.fillStyle = s.color;
            ctx.fillText(s.name, ...this.proj2xy(s));
        }
        ctx.restore();
    }
    drawAirport(ctx) {
        ctx.save();
        ctx.font = '9px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let s of Object.values(vm.airport)) {
            ctx.fillText(s.name, ...this.proj2xy(s));
        }
        ctx.restore();
    }
    drawRunway(ctx) {
        ctx.save();
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let s of vm.runway) {
            let [x1, y1, x2, y2] = this.proj2xy2(s);
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        }
        ctx.stroke();
        ctx.restore();
    }
    drawRunwayName(ctx) {
        ctx.save();
        ctx.font = '9px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        for (let s of vm.runway) {
            let [x1, y1, x2, y2] = this.proj2xy2(s);
            ctx.fillText(s.name1, x1, y1);
            ctx.fillText(s.name2, x2, y2);
        }
        ctx.restore();
    }
    drawAirway(ctx, airway) {
        ctx.save();
        ctx.beginPath();
        for (let s of airway) {
            let [x1, y1, x2, y2] = this.proj2xy2(s);
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        }
        ctx.stroke();
        ctx.restore();
    }
    drawArtcc(ctx, artcc) {
        ctx.save();
        ctx.beginPath();
        for (let s of artcc) {
            let [x1, y1, x2, y2] = this.proj2xy2(s);
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        }
        ctx.stroke();
        ctx.restore();
    }
    drawGeo(ctx) {
        ctx.save();
        for (let geo of Object.values(vm.geo)) {
            ctx.strokeStyle = geo[0].color;
            ctx.beginPath();
            for (let s of geo) {
                let [x1, y1, x2, y2] = this.proj2xy2(s);
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
            }
            ctx.stroke();
        }
        ctx.restore();
    }
    drawRegions(ctx) {
        ctx.save();
        for (let region of vm.regions) {
            ctx.strokeStyle = region.color;
            ctx.beginPath();
            for (let s of region) {
                ctx.lineTo(...this.proj2xy(s));
            }
            // ctx.closePath();
            ctx.stroke();
        }
        ctx.restore();
    }
    drawMap(ctx) {
        ctx.save();
        ctx.translate(-this.centerX + this.width / 2, -this.centerY + this.height / 2);
        this.drawVor(ctx);
        this.drawNdb(ctx);
        this.drawFixes(ctx);
        this.drawAirport(ctx);
        this.drawRunway(ctx);
        this.drawRunwayName(ctx);
        this.drawLabels(ctx);
        this.drawAirway(ctx, vm.highAirway);
        this.drawAirway(ctx, vm.lowAirway);
        this.drawArtcc(ctx, vm.artcc);
        this.drawArtcc(ctx, vm.artccHigh);
        this.drawArtcc(ctx, vm.artccLow);
        this.drawGeo(ctx);
        this.drawRegions(ctx);
        ctx.restore();
    }
    draw() {
        this.updateViewport();
        let ctx = this.canvas.getContext('2d', { alpha: false });
        ctx.save();
        ctx.scale(this.ratio, this.ratio);
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.strokeRect(0, 0, this.width, this.height);
        ctx.font = "12px serif";
        ctx.fillText("x: " + this.centerX + " y: " + this.centerY, 80, 80);
        ctx.fillText("width: " + this.width + " height: " + this.height, 80, 100);
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
        this.updateViewport({ x: newx, y: newy }, newzoom);
    }
    zoomOut() {
        console.log('zoom-out');
        let newzoom = this.zoom * (1 + ZOOM_FACTOR);
        let newx = this.centerX * (1 + (this.zoom - newzoom) / newzoom);
        let newy = this.centerY * (1 + (this.zoom - newzoom) / newzoom);
        this.updateViewport({ x: newx, y: newy }, newzoom);
    }
}