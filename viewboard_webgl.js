
const ZOOM_FACTOR = 0.2; // percentage
const ZOOM_IN_TRANSLATE_FACTOR = ZOOM_FACTOR / (1 - ZOOM_FACTOR) + 1;
const ZOOM_OUT_TRANSLATE_FACTOR = -ZOOM_FACTOR / (1 + ZOOM_FACTOR) + 1;

const ARTCC_COLOR = [0.5, 0.5, 0.5, 1];
const AIRWAY_COLOR = [0.3, 0.3, 0.3, 1];
const RUNWAY_COLOR = [0.0, 0.0, 0.0, 1];
const VOR_COLOR = [0.0, 0.0, 0.0, 1];

class ViewBoardWebGL {
    constructor(glCanvas, ctxCanvas, settings = null, ratio = 1) {
        this.glCanvas = glCanvas;
        this.ctxCanvas = ctxCanvas;
        settings.viewboard = this.settings = {
            parent: settings
        };
        this.initSettings();
        // this.updateViewport({ x: 0.0, y: 0.0 }, 1.0, ratio);
        this.updateViewport({ x: 3000.0, y: -1130.0 }, 4000.0, ratio);

        this.initWebGL();
    }
    setupModel(model) {
        this.model = model;
        if (!model) {
            this.buffers = undefined;
            return;
        }
        this.buffers = {};
        let gl = twgl.getContext(this.glCanvas);
        this.setupArtcc(gl, 'artcc');
        this.setupArtcc(gl, 'artccHigh');
        this.setupArtcc(gl, 'artccLow');
        this.setupAirway(gl, 'highAirway');
        this.setupAirway(gl, 'lowAirway');
        this.setupRegions(gl);
        this.setupGeo(gl);
        this.setupRunway(gl);
    }
    loadTextSetting(id, ctx) {
        let setting = this.settings[id];
        ctx.font = setting.font;
        ctx.textAlign = setting.textAlign;
        ctx.textBaseline = setting.textBaseline;
        ctx.strokeStyle = setting.strokeStyle;
    }
    proj2xy(s) {
        return [
            s.projX / this.scale,
            s.projY / this.scale,
        ];
    }
    proj2xy2(s) {
        return [
            s.projX1 / this.scale,
            s.projY1 / this.scale,
            s.projX2 / this.scale,
            s.projY2 / this.scale,
        ];
    }
    drawFixes(ctx) {
        ctx.save();
        this.loadTextSetting('fixes', ctx);
        for (let s of Object.values(this.model.fixes)) {
            ctx.fillText(s.name, ...this.proj2xy(s));
        }
        ctx.restore();
    }
    drawVor(ctx) {
        ctx.save();
        this.loadTextSetting('vor', ctx);
        let vorPath = new Path2D('M-8 -8 h16 v16 h-16 Z M-4 -8 h8 l4 8 l-4 8 h-8 l-4 -8 Z');
        for (let s of Object.values(this.model.vor)) {
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
        for (let s of Object.values(this.model.ndb)) {
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
    drawLabels(ctx) {
        ctx.save();
        ctx.font = '8px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let s of this.model.labels) {
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
        for (let s of Object.values(this.model.airport)) {
            ctx.fillText(s.name, ...this.proj2xy(s));
        }
        ctx.restore();
    }

    setupRunway(gl) {
        this.buffers.runway = twgl.createBufferInfoFromArrays(gl, {
            a_position: {
                numComponents: 2,
                data: new Float32Array(
                    this.model.runway.map(s => [s.projX1, s.projY1, s.projX2, s.projY2]).flat()
                )
            }
        });
    }
    drawRunway(gl) {
        this.useLineProgram(gl, this.buffers.runway, gl.LINES, RUNWAY_COLOR);
    }

    setupAirway(gl, name) {
        this.buffers[name] = twgl.createBufferInfoFromArrays(gl, {
            a_position: {
                numComponents: 2,
                data: new Float32Array(
                    this.model[name].map(s => [s.projX1, s.projY1, s.projX2, s.projY2]).flat()
                )
            }
        });
    }
    drawAirway(gl, ctx, name) {
        this.useLineProgram(gl, this.buffers[name], gl.LINES, AIRWAY_COLOR);
        ctx.save();
        this.loadTextSetting(name, ctx);
        for (let s of this.model[name]) {
            let [x1, y1, x2, y2] = this.proj2xy2(s);
            let angle = x1 < x2 ? Math.atan2(y2 - y1, x2 - x1) : Math.atan2(y1 - y2, x1 - x2);
            ctx.save();
            ctx.translate(x1 + (x2 - x1) / 2, y1 + (y2 - y1) / 2);
            ctx.rotate(angle);
            ctx.fillText(s.name, 0, 0);
            ctx.restore();
        }
        ctx.restore();
    }

    setupArtcc(gl, name) {
        this.buffers[name] = twgl.createBufferInfoFromArrays(gl, {
            a_position: {
                numComponents: 2,
                data: new Float32Array(
                    this.model[name].map(s => [s.projX1, s.projY1, s.projX2, s.projY2]).flat()
                )
            }
        });
    }
    drawArtcc(gl, name) {
        this.useLineProgram(gl, this.buffers[name], gl.LINES, ARTCC_COLOR);
    }

    setupGeo(gl) {
        this.buffers.geo = {};
        for (let [name, geo] of Object.entries(this.model.geo)) {
            this.buffers.geo[name] = (twgl.createBufferInfoFromArrays(gl, {
                a_position: {
                    numComponents: 2,
                    data: new Float32Array(
                        geo.map(s => [s.projX1, s.projY1, s.projX2, s.projY2]).flat()
                    )
                }
            }));
        }
    }
    drawGeo(gl) {
        for (let [name, buffer] of Object.entries(this.buffers.geo)) {
            this.useLineProgram(gl, buffer, gl.LINES, this.model.geo[name].rgba);
        }
    }

    setupRegions(gl) {
        this.buffers.regions = this.model.regions.map(region => {
            return twgl.createBufferInfoFromArrays(gl, {
                a_position: {
                    numComponents: 2,
                    data: new Float32Array(
                        region.map(s => [s.projX, s.projY]).flat()
                    )
                }
            });
        });
    }
    drawRegions(gl) {
        for (let [index, buffer] of this.buffers.regions.entries()) {
            this.useLineProgram(gl, buffer, gl.LINE_LOOP, this.model.regions[index].rgba);
        }
    }

    useLineProgram(gl, buffer, type, color) {
        gl.useProgram(this.lineProgramInfo.program);
        twgl.setBuffersAndAttributes(gl, this.lineProgramInfo, buffer);
        twgl.setUniforms(this.lineProgramInfo, {
            u_resolution: [this.width, this.height],
            u_translation: [-this.centerX + this.width / 2, -this.centerY + this.height / 2],
            u_scale: this.scale,
            u_color: color,
        });
        twgl.drawBufferInfo(gl, buffer, type);
    }

    drawMap(gl, ctx) {
        ctx.save();
        ctx.translate(-this.centerX + this.width / 2, -this.centerY + this.height / 2);
        this.drawGeo(gl);
        this.drawRegions(gl);
        this.drawArtcc(gl, 'artcc');
        this.drawArtcc(gl, 'artccHigh');
        this.drawArtcc(gl, 'artccLow');
        this.drawAirway(gl, ctx, 'highAirway');
        this.drawAirway(gl, ctx, 'lowAirway');
        this.drawRunway(gl);
        this.drawVor(ctx);
        this.drawNdb(ctx);
        this.drawFixes(ctx);
        this.drawAirport(ctx);
        this.drawLabels(ctx);
        ctx.restore();
    }

    draw() {
        let gl = twgl.getContext(this.glCanvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        let ctx = layer2.getContext('2d');
        ctx.save();
        ctx.scale(this.ratio, this.ratio);
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.strokeRect(0, 0, this.width, this.height);
        if (this.model) {
            this.drawMap(gl, ctx);
        }
        ctx.restore();
    }
    zoomIn() {
        this.updateViewport({
            x: this.centerX * ZOOM_IN_TRANSLATE_FACTOR,
            y: this.centerY * ZOOM_IN_TRANSLATE_FACTOR,
        }, this.scale * (1 - ZOOM_FACTOR));
    }
    zoomOut() {
        this.updateViewport({
            x: this.centerX * ZOOM_OUT_TRANSLATE_FACTOR,
            y: this.centerY * ZOOM_OUT_TRANSLATE_FACTOR,
        }, this.scale * (1 + ZOOM_FACTOR));
    }
    updateViewport(center, scale, ratio) {
        if (center) {
            this.centerX = center.x;
            this.centerY = center.y;
        }
        if (scale) {
            this.scale = scale;
        }
        if (ratio) {
            this.ratio = ratio;
        }
        this.width = this.glCanvas.width / this.ratio;
        this.height = this.glCanvas.height / this.ratio;

        console.log(`viewport: x=${this.centerX}, y=${this.centerY}, scale=${this.scale}`);
    }
    initWebGL() {
        let gl = twgl.getContext(this.glCanvas);
        if (!gl) {
            console.log('Fail to create webgl context.');
            return;
        }
        this.lineProgramInfo = twgl.createProgramInfo(gl, ['line-vert-source', 'line-frag-source']);
        gl.depthMask(false);
    }
    initSettings() {
        this.settings['fixes'] = {
            // font: { default: '9px serif', type: SETTING.FONT },
            // textAlign: { default: 'center', type: SETTING.TEXT_ALIGN },
            font: '9px serif',
            textAlign: 'center',
            textBaseline: 'middle',
            strokeStyle: '#000000',
        };
        this.settings['vor'] = {
            font: '13px serif',
            textAlign: 'center',
            textBaseline: 'bottom',
            strokeStyle: '#000000',
        }
        this.settings['highAirway'] = {
            font: '11px serif',
            textAlign: 'center',
            textBaseline: 'bottom',
            strokeStyle: '#000000',
        }
        this.settings['lowAirway'] = {
            font: '11px serif',
            textAlign: 'center',
            textBaseline: 'bottom',
            strokeStyle: '#000000',
        }
    }
}