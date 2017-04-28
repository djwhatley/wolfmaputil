var fs = require('fs');
var shapefile = require('shapefile');

var getDistrictGeoJSON = function (district, boundary) {
    var geo = {
        "type": "Feature",
        "id": district.id,
        "properties": {
            "name": getDistrictName(district.id)
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": boundary.shape[0]
        }
    };

    return geo; 
}

var getDistrictName = function (districtId) {
    var match = /ga-(lower|upper)-([0-9]+)/.exec(districtId);
    var ret = 'GA ';
    if (match[1] == 'lower')
        ret += 'House District ';
    else if (match[1] == 'upper')
        ret += 'Senate District ';
    ret += '#' + match[2];

    console.log(ret);
    return ret;
}

var writing = false;
var writeMap = function (features) {
    if (writing) 
        return;
    
    writing = true;

    console.log(features.length)

    console.log('Writing \'mapdata.js\' ...');

    let fd = fs.openSync('mapdata.js', 'a+');

    let offset = 0;
    offset += fs.writeSync(fd, 'var mapdata = {"type":"FeatureCollection","features":[');

    for (let feature of features) {
        feature.properties.id = feature.properties['NAMELSAD'];
        console.log(feature.properties.id);
        offset += fs.writeSync(fd, JSON.stringify(feature) + ',', offset);
    }

    fs.writeSync(fd, ']};', offset)
    fs.closeSync(fd);

    console.log('Finished writing \'mapdata.js\'');

    process.exit();

    /*fs.open('mapdata.js', 'a+', (err, fd) => {
        console.log('FUCK ASOIDGASDyqaez');
        if (err)
            console.error(err);
        
        console.log(fd);
        fs.write(fd, 'var mapdata = {"type":"FeatureCollection","features":[', (err, writ, str) => {
            let c = 0;
            console.log('COCKASS');

            for (let feature of features) {
                fs.write(fd, JSON.stringify(feature) + ',', (e, w, s) => {
                    console.log('.');
                    c++;
                    if (c == features.length) 
                        finishWrite(fd);
                });
            }
        });               
    });*/

  }


var finishWrite = function (fd) {
    fs.write(fd, ']};', (err, written, str) => {
        if (err)
            console.error(err);
        else
            console.log('Finished writing \'mapdata.js\'');
        writing = false;
        fs.close(fd);
    });
};

var main = function () {
    let features = [];

    shapefile.open('tl_2016_13_sldl/tl_2016_13_sldl.shp')
        .then(source => source.read()
            .then(function log(result) {
                if (result.done) writeMap(features);
                features.push(result.value);
                return source.read().then(log);
            }))
        .catch(err => console.error(err));

    /*fs.readdir('bounds', (err, bounds) => {     
        for (let bound of bounds) {
            let dist = bound.split('.')[0];

            fs.readFile('bounds/' + bound, (err, data) => {
                let rawBoundary = '';

                for (let d of data) {
                    rawBoundary += String.fromCharCode(d);
                }

                let boundary = JSON.parse(rawBoundary);
                
                let district = {
                    id: dist
                };

                let geo = getDistrictGeoJSON(district, boundary);
                featureCollection.features.push(geo);

                if (featureCollection.features.length == bounds.length) {
                    writeMap(featureCollection);
                }
            });
        }

    })*/

};

main();