class ViewBoard {
    constructor(dom) {
        this.dom = dom;
        this.zoom = 100.0;
        this.topleft = {'x':0, 'y':0};
    }
    drawStation(ctx, station) {
        let x = station.latitude * this.zoom;
        let y = station.longitude * this.zoom;
        station.x = x;
        station.y = y;
        ctx.fillText(station.name, x + this.topleft.x, y + this.topleft.y);
    }
    drawMap(ctx) {
        console.log('Draw Map');
        for (let [key,value] of Object.entries(vm.stations)) {
            this.drawStation(ctx, value);
        }
    }
    draw() {
        let ctx = this.dom[0].getContext('2d');
        this.width = this.dom.width();
        this.height = this.dom.height();
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.strokeRect(0, 0, this.width, this.height);
        ctx.fillText("top_x: "+this.topleft.x+" top_y: "+this.topleft.y, 80, 80);
        ctx.fillText("width: "+this.width+" height: "+this.height, 80, 90);
        ctx.fillText("zoom: " + this.zoom, 80, 100);
        if (vm) {
            this.drawMap(ctx);
        }
    }
}

var vm = undefined;
var vb = new ViewBoard($('#viewboard'), vm);
vb.draw();