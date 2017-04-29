var fs = require('fs');
var shapefile = require('shapefile');

var settings = require('./settings');

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

var writeMap = function (geodata, destFile, cb) {
    console.log("Writing '" + destFile + "' ...");

    fs.writeFile(destFile, JSON.stringify(geodata), (err) => {
        console.log("Finished writing '" + destFile + "'");

        cb();
    });
}

module.exports = {
    shp2GeoJSON:  function (srcFile, destFile, cb) {
        let featureCollection = {
            type: 'FeatureCollection',
            features: []
        }

        shapefile.open(srcFile)
            .then(source => source.read()
                .then(function log(result) {
                    if (result.done) {
                        writeMap(featureCollection, destFile, function () {
                            cb();
                        });
                        return;
                    }
                    featureCollection.features.push(result.value);
                    return source.read().then(log);
                }))
            .catch(err => console.error(err));
        }
}