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
            '[GEO]': this.parseGeo
        };
        this.model = {
            define: {},
            info: [],
            vor: {},
            ndb: {},
            fixes: {},
            airport: {},
            runway: [],
        };
        console.log(this.model.define);
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
        let station = this.parseStation(raw);
        if (station) {
            this.model.vor[station.name] = station;
        }
    }
    parseNdb(raw) {
        let station = this.parseStation(raw);
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
        let station = this.parseStation(raw);
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
    parseSid(raw) { }
    parseStar(raw) { }
    parseHighAirway(raw) { }
    parseLowAirway(raw) { }
    parseArtcc(raw) { }
    parseArtccHigh(raw) { }
    parseArtccLow(raw) { }
    parseGeo(raw) { }

    parseStation(raw) {
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
    static latitude_regex = /([NS])(\d\d\d)\.(\d\d)\.(\d\d)\.(\d\d\d)/;
    parseLatitude(raw) {
        let s = SectorParser.latitude_regex.exec(raw);
        if (s) {
            return (s[1] == 'N' ? -1 : 1) * (
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

    parseRow(raw) {
        let r = raw.trim();
        if (Object.keys(this.sectionFunctor).includes(r)) {
            this.section = r;
        } else {
            let functor = this.sectionFunctor[this.section];
            functor.call(this, raw);
        }
    }
    parse() {
        for (let r of this.rows) {
            this.parseRow(r);
        }
    }
}