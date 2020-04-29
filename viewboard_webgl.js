
const ZOOM_FACTOR = 0.2; // percentage
const ZOOM_IN_TRANSLATE_FACTOR = ZOOM_FACTOR / (1 - ZOOM_FACTOR) + 1;
const ZOOM_OUT_TRANSLATE_FACTOR = -ZOOM_FACTOR / (1 + ZOOM_FACTOR) + 1;

const ARTCC_COLOR = [0.5, 0.5, 0.5, 1];
const AIRWAY_COLOR= [0.3, 0.3, 0.3, 1];
const RUNWAY_COLOR= [0.0, 0.0, 0.0, 1];
const VOR_COLOR= [0.0, 0.0, 0.0, 1];

class ViewBoardWebGL {
    constructor(layer1, layer2, model, settings, ratio = 1) {
        this.layer1 = layer1;
        this.layer2 = layer2;
        this.model = model;
        settings.viewboard = this.settings = {
            parent: settings
        };
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
        // this.updateViewport({ x: 0.0, y: 0.0 }, 1.0, ratio);
        this.updateViewport({ x: 3000.0, y: -1130.0 }, 4000.0, ratio);

        this.initWebGL().then((gl) => this.gl = gl);
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
        for (let s of Object.values(vm.fixes)) {
            ctx.fillText(s.name, ...this.proj2xy(s));
        }
        ctx.restore();
    }
    drawVor(ctx) {
        ctx.save();
        this.loadTextSetting('vor', ctx);
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

    drawRunway(gl) {
        let a = this.model.runway.map(s => [s.projX1, s.projY1, s.projX2, s.projY2]).flat();
        this.useLineProgram(gl, a, gl.LINES, RUNWAY_COLOR);
    }

    drawAirway(gl, ctx, airway) {
        let a = airway.map(s => [s.projX1, s.projY1, s.projX2, s.projY2]).flat();
        this.useLineProgram(gl, a, gl.LINES, AIRWAY_COLOR);
        for (let s of airway) {
            let [x1, y1, x2, y2] = this.proj2xy2(s);
            let angle = Math.atan2(y2 - y1, x2 - x1);
            ctx.save();
            ctx.translate(x1 + (x2 - x1) / 2, y1 + (y2 - y1) / 2);
            ctx.rotate(angle);
            ctx.fillText(s.name, 0, 0);
            ctx.restore();
        }
    }

    drawArtcc(gl, artcc) {
        let a = artcc.map(s => [s.projX1, s.projY1, s.projX2, s.projY2]).flat();
        this.useLineProgram(gl, a, gl.LINES, ARTCC_COLOR);
    }
    
    drawGeo(gl) {
        for (let geo of Object.values(this.model.geo)) {
            let a = geo.map(s => [s.projX1, s.projY1, s.projX2, s.projY2]).flat();
            this.useLineProgram(gl, a, gl.LINES, geo.rgba);
        }
    }

    drawRegions(gl) {
        for (let region of this.model.regions) {
            let a = region.map(s => [s.projX, s.projY]).flat();
            this.useLineProgram(gl, a, gl.LINE_LOOP, region.rgba);
        }
    }

    useLineProgram(gl, a, mode, color) {
        gl.useProgram(this.line.program);
        gl.enableVertexAttribArray(this.line.a_position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.line.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(a), gl.STREAM_DRAW);
        gl.vertexAttribPointer(this.line.a_position, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(this.line.u_resolution, this.width, this.height);
        // gl.uniform2f(this.line.u_resolution, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(this.line.u_translation, -this.centerX + this.width / 2, -this.centerY + this.height / 2);
        gl.uniform1f(this.line.u_scale, this.scale);
        gl.uniform4f(this.line.u_color, ...color);
        gl.drawArrays(mode, 0, a.length / 2);
    }

    drawMap(gl, ctx) {
        ctx.save();
        ctx.translate(-this.centerX + this.width / 2, -this.centerY + this.height / 2);
        this.drawGeo(gl);
        this.drawRegions(gl);
        this.drawArtcc(gl, this.model.artcc);
        this.drawArtcc(gl, this.model.artccHigh);
        this.drawArtcc(gl, this.model.artccLow);
        this.drawAirway(gl, ctx, this.model.highAirway);
        this.drawAirway(gl, ctx, this.model.lowAirway);
        this.drawRunway(gl);
        this.drawVor(ctx);
        this.drawNdb(ctx);
        this.drawFixes(ctx);
        this.drawAirport(ctx);
        this.drawLabels(ctx);
        ctx.restore();
    }

    draw() {
        let gl = this.gl;
        if (!gl) {
            console.log('Context webgl not ready.');
            return;
        }
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        let ctx = layer2.getContext('2d');
        ctx.save();
        ctx.scale(this.ratio, this.ratio);
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.strokeRect(0, 0, this.width, this.height);
        if (this.model)
            this.drawMap(gl, ctx);
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
        this.width = this.layer1.width / this.ratio;
        this.height = this.layer1.height / this.ratio;

        console.log(`viewport: x=${this.centerX}, y=${this.centerY}, scale=${this.scale}`);
    }
    async initWebGL() {
        function createShader(gl, type, source) {
            let shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
            if (success) {
                return shader;
            }
            console.log(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
        }
        function createProgram(gl, vertexShader, fragmentShader) {
            let program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            let success = gl.getProgramParameter(program, gl.LINK_STATUS);
            if (success) {
                return program;
            }
            console.log(gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
        }

        let gl = this.layer1.getContext('webgl');
        if (!gl) {
            console.log('Fail to create webgl context.');
            return;
        }

        let lineVertSource = await (await fetch('line.vert')).text();
        let lineFragSource = await (await fetch('line.frag')).text();
        
        let lineVert = createShader(gl, gl.VERTEX_SHADER, lineVertSource);
        let lineFrag = createShader(gl, gl.FRAGMENT_SHADER, lineFragSource);

        this.line = (function(program) { return {
            program: program,
            a_position: gl.getAttribLocation(program, 'a_position'),
            u_resolution: gl.getUniformLocation(program, 'u_resolution'),
            u_translation: gl.getUniformLocation(program, 'u_translation'),
            u_scale: gl.getUniformLocation(program, 'u_scale'),
            u_color: gl.getUniformLocation(program, 'u_color'),
            positionBuffer: gl.createBuffer(),
        }})(createProgram(gl, lineVert, lineFrag));

        gl.depthMask(false);

        return gl;
    }
}