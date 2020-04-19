class SectorParser {
    constructor(data) {
        this.data = data;
        this.rows = data.split(/\r\n|\r|\n/);
        this.section = 'DEFINE';
        this.sectionFunctor = {
            'DEFINE': this.parseDefine,
            '[INFO]': this.parseInfo,
            '[VOR]': this.parseVor,
            '[NDB]': this.parseNdb,
            '[FIXES]': this.parseFixes,
            '[AIRPORT]': this.parseAirport,
            '[RUNWAY]': this.parseRunway,
            '[SID]': this.parseSid,
            '[STAR]': this.parseStar,
            '[HIGH AIRWAY]': this.parseHighAirway,
            '[LOW AIRWAY]': this.parseLowAirway,
            '[ARTCC]': this.parseArtcc,
            '[ARTCC HIGH]': this.parseArtccHigh,
            '[ARTCC LOW]': this.parseArtccLow,
            '[GEO]': this.parseGeo,
            '[LABELS]': this.parseLabels,
            '[REGIONS]': this.parseRegions,
        };
        this.model = {
            define: {},
            info: [],
            vor: {},
            ndb: {},
            fixes: {},
            airport: {},
            runway: [],
            sid: {},
            star: {},
            highAirway: [],
            lowAirway: [],
            artcc: [],
            artccHigh: [],
            artccLow: [],
            geo: {},
            labels: [],
            regions: [],
        };
        this.parse();
    }

    parseDefine(raw) {
        let s = raw.split(' ').filter(x => x);
        let key, value;
        if (s.length >= 2 &&
            s[0] == '#define' &&
            (key = s[1]) &&
            !isNaN(value = parseInt(s[2]))) {
            this.model.define[key] = value;
        }
    }
    parseInfo(raw) {
        let s = raw.trim();
        if (s) this.model.info.push(s);
    }
    parseVor(raw) {
        let station = this._parseStation(raw);
        if (station) {
            this.model.vor[station.name] = station;
        }
    }
    parseNdb(raw) {
        let station = this._parseStation(raw);
        if (station) {
            this.model.ndb[station.name] = station;
        }
    }
    parseFixes(raw) {
        let s = raw.split(' ').filter(x => x);
        let name, lat, lon;
        if (s.length >= 3 &&
            (name = s[0]) &&
            !isNaN(lat = this.parseLatitude(s[1])) &&
            !isNaN(lon = this.parseLongitude(s[2]))) {
            this.model.fixes[name] = {
                name: name,
                lat: lat,
                lon: lon,
            };
        }
    }
    parseAirport(raw) {
        let station = this._parseStation(raw);
        if (station) {
            this.model.airport[station.name] = station;
        }
    }
    parseRunway(raw) {
        let s = raw.split(' ').filter(x => x);
        let name1, name2, heading1, heading2, lat1, lon1, lat2, lon2;
        if (s.length >= 8 &&
            (name1 = s[0]) &&
            (name2 = s[1]) &&
            (heading1 = s[2]) &&
            (heading2 = s[3]) &&
            !isNaN(lat1 = this.parseLatitude(s[4])) &&
            !isNaN(lon1 = this.parseLongitude(s[5])) &&
            !isNaN(lat2 = this.parseLatitude(s[6])) &&
            !isNaN(lon2 = this.parseLongitude(s[7]))) {
            this.model.runway.push({
                name1: name1,
                name2: name2,
                heading1: heading1,
                heading2: heading2,
                lat1: lat1,
                lon1: lon1,
                lat2: lat2,
                lon2: lon2,
                desc: s.slice(8).join(' ')
            });
        }
    }
    parseSid(raw) {
        let value = this._parseSidStar(raw);
        if (value) {
            if (this.model.sid[value[0]] != undefined) {
                this.model.sid[value[0]].push(value[1]);
            } else {
                this.model.sid[value[0]] = [value[1]];
            }
        }
    }
    parseStar(raw) {
        let value = this._parseSidStar(raw);
        if (value) {
            if (this.model.star[value[0]] != undefined) {
                this.model.star[value[0]].push(value[1]);
            } else {
                this.model.star[value[0]] = [value[1]];
            }
        }
    }
    parseHighAirway(raw) {
        let airway = this._parseAirway(raw);
        if (airway) {
            this.model.highAirway.push(airway);
        }
    }
    parseLowAirway(raw) {
        let airway = this._parseAirway(raw);
        if (airway) {
            this.model.lowAirway.push(airway);
        }
    }
    parseArtcc(raw) {
        let artcc = this._parseArtcc(raw);
        if (artcc) {
            this.model.artcc.push(artcc);
        }
    }
    parseArtccHigh(raw) {
        let artcc = this._parseArtcc(raw);
        if (artcc) {
            this.model.artccHigh.push(artcc);
        }
    }
    parseArtccLow(raw) {
        let artcc = this._parseArtcc(raw);
        if (artcc) {
            this.model.artccLow.push(artcc);
        }
    }
    parseGeo(raw) {
        let s = raw.split(' ').filter(x => x);
        let name, lat1, lon1, lat2, lon2, color;
        let len = s.length;
        if (len >= 5 &&
            (color = this.parseColor(s[len - 1])) &&
            !isNaN(lon2 = this.parseLongitude(s[len - 2])) &&
            !isNaN(lat2 = this.parseLatitude(s[len - 3])) &&
            !isNaN(lon1 = this.parseLongitude(s[len - 4])) &&
            !isNaN(lat1 = this.parseLatitude(s[len - 5]))) {
            name = s.slice(0, len - 5).join(' ') || this.lastGeoName || '';
            this.lastGeoName = name;
            if (this.model.geo[name] == undefined) {
                this.model.geo[name] = [];
            }
            this.model.geo[name].push({
                lat1: lat1,
                lon1: lon1,
                lat2: lat2,
                lon2: lon2,
                color: color,
            });
        }
    }
    parseRegions(raw) {
        let s = raw.split(' ').filter(x => x);
        let len = s.length;
        if (len >= 2 && s[0] == 'REGIONNAME') {
            let newregion = [];
            newregion.name = s[1];
            this.model.regions.push(newregion);
            return;
        }
        let currentRegion = this.model.regions[this.model.regions.length - 1];
        if (currentRegion == undefined) return;
        if (currentRegion.color == undefined && len >= 1) {
            currentRegion.color = this.parseColor(s[0]) || '#000';
        }
        let lat, lon;
        if (len >= 2 &&
            !isNaN(lon = this.parseLongitude(s[len - 1])) &&
            !isNaN(lat = this.parseLatitude(s[len - 2]))) {
            currentRegion.push({
                lat: lat,
                lon: lon,
            });
        }
    }
    parseLabels(raw) {
        let start = raw.indexOf('"');
        let end = raw.lastIndexOf('"');
        if (start == -1 || end == -1 || end - start < 2) {
            return;
        }
        let label = raw.slice(start + 1, end);
        let lat, lon, color;
        let s = raw.slice(end + 1).split(' ').filter(x => x);
        if (s.length >= 3 &&
            !isNaN(lat = this.parseLatitude(s[0])) &&
            !isNaN(lon = this.parseLongitude(s[1])) &&
            (color = this.parseColor(s[2]))) {
            this.model.labels.push({
                name: label,
                lat: lat,
                lon: lon,
                color: color,
            });
        }
    }

    _parseSidStar(raw) {
        let s = raw.split(' ').filter(x => x);
        let name, lat1, lon1, lat2, lon2;
        let len = s.length;
        if (len >= 4 &&
            !isNaN(lon2 = this.parseLongitude(s[len - 1])) &&
            !isNaN(lat2 = this.parseLatitude(s[len - 2])) &&
            !isNaN(lon1 = this.parseLongitude(s[len - 3])) &&
            !isNaN(lat1 = this.parseLatitude(s[len - 4]))) {
            name = s.slice(0, len - 4).join(' ') || this.lastSidStarName || '';
            this.lastSidStarName = name;
            return [name, {
                lat1: lat1,
                lon1: lon1,
                lat2: lat2,
                lon2: lon2,
            }];
        }
        return null;
    }

    _parseArtcc(raw) {
        let s = raw.split(' ').filter(x => x);
        let lat1, lon1, lat2, lon2;
        let len = s.length;
        if (len >= 5 &&
            !isNaN(lon2 = this.parseLongitude(s[len - 1])) &&
            !isNaN(lat2 = this.parseLatitude(s[len - 2])) &&
            !isNaN(lon1 = this.parseLongitude(s[len - 3])) &&
            !isNaN(lat1 = this.parseLatitude(s[len - 4]))) {
            return {
                name: s.slice(0, len - 4).join(' '),
                lat1: lat1,
                lon1: lon1,
                lat2: lat2,
                lon2: lon2,
            };
        }
        return null;
    }

    _parseAirway(raw) {
        let s = raw.split(' ').filter(x => x);
        let name, lat1, lon1, lat2, lon2;
        if (s.length >= 5 &&
            (name = s[0]) &&
            !isNaN(lat1 = this.parseLatitude(s[1])) &&
            !isNaN(lon1 = this.parseLongitude(s[2])) &&
            !isNaN(lat2 = this.parseLatitude(s[3])) &&
            !isNaN(lon2 = this.parseLongitude(s[4]))) {
            return {
                name: name,
                lat1: lat1,
                lon1: lon1,
                lat2: lat2,
                lon2: lon2,
            };
        }
        return null;
    }

    _parseStation(raw) {
        let s = raw.split(' ').filter(x => x);
        let name, freq, lat, lon;
        if (s.length >= 4 &&
            (name = s[0]) &&
            !isNaN(freq = parseFloat(s[1])) &&
            !isNaN(lat = this.parseLatitude(s[2])) &&
            !isNaN(lon = this.parseLongitude(s[3]))) {
            return {
                name: name,
                freq: freq,
                lat: lat,
                lon: lon,
            };
        }
        return null;
    }
    parseColor(raw) {
        let value;
        let define = this.model.define[raw];
        if (define != undefined) {
            value = define;
        } else {
            value = raw;
        }
        let number = parseInt(value);
        if (isNaN(number)) {
            return null;
        }
        return '#' + number.toString(16).padStart(6, '0').slice(0, 6);
    }
    static latitude_regex = /([NS])(\d\d\d)\.(\d\d)\.(\d\d)\.(\d\d\d)/;
    parseLatitude(raw) {
        let station = this.findStation(raw);
        if (station) {
            return station.lat;
        }
        let s = SectorParser.latitude_regex.exec(raw);
        if (s) {
            return (s[1] == 'S' ? -1 : 1) * (
                parseInt(s[2]) +
                parseInt(s[3]) / 60.0 +
                parseInt(s[4]) / 3600.0 +
                parseInt(s[5]) / 3600000.0
            );
        }
        return NaN;
    }
    static longitude_regex = /([WE])(\d\d\d)\.(\d\d)\.(\d\d)\.(\d\d\d)/;
    parseLongitude(raw) {
        let station = this.findStation(raw);
        if (station) {
            return station.lon;
        }
        let s = SectorParser.longitude_regex.exec(raw);
        if (s) {
            return (s[1] == 'W' ? -1 : 1) * (
                parseInt(s[2]) +
                parseInt(s[3]) / 60.0 +
                parseInt(s[4]) / 3600.0 +
                parseInt(s[5]) / 3600000.0
            );
        }
        return NaN;
    }

    findStation(name) {
        return this.model.vor[name] || this.model.ndb[name] || this.model.fixes[name];
    }

    parseRow(raw) {
        let r = raw.trim();
        if (r.length == 0 || r[0] == ';') return;
        if (r[0] == '[' && r[r.length - 1] == ']') {
            this.section = r;
        } else {
            let functor = this.sectionFunctor[this.section];
            if (functor != undefined) {
                functor.call(this, raw);
            }
        }
    }
    parse() {
        for (let r of this.rows) {
            this.parseRow(r);
        }
    }
}