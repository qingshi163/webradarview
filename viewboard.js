
class ViewBoard {
    constructor(canvas) {
        this.canvas = canvas;
        this.zoom = 100.0;
        this.topleft = {'x':0, 'y':0};
    }
    drawStation(ctx, station) {
        [station.proj_x, station.proj_y] = forward([station.latitude, station.longitude]);
        station.screen_x = station.proj_x / this.zoom;
        station.screen_y = station.proj_y / this.zoom;
        ctx.fillText(station.name,  + this.topleft.x, y + this.topleft.y);
    }
    drawMap(ctx) {
        console.log('Draw Map');
        for (let [key,value] of Object.entries(vm.stations)) {
            this.drawStation(ctx, value);
        }
    }
    draw() {
        let ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.strokeRect(0, 0, this.width, this.height);
        ctx.font = "12px serif";
        ctx.fillText("top_x: "+this.topleft.x+" top_y: "+this.topleft.y, 80, 80);
        ctx.fillText("width: "+this.width+" height: "+this.height, 80, 90);
        ctx.fillText("zoom: " + this.zoom, 80, 100);
        if (vm) {
            this.drawMap(ctx);
        }
    }
}