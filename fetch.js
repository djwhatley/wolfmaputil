var fs = require('fs-extra');
var https = require('https');
var unzip = require('unzip');

var settings = require('./settings');
var map = require('./map');

var extractData = function (srcFile, destFile) {
    let unzipPath = srcFile.split('.zip')[0];
    let sp = unzipPath.split('/'), 
        filename = sp[sp.length - 1];

    console.log("Extracting '" + srcFile + "' ...");
    let stream = fs.createReadStream(srcFile);
    
    stream.pipe(unzip.Extract({ path: unzipPath }));

    stream.on('end', () => {
        console.log("Finished extracting '" + srcFile + "'");

        map.shp2GeoJSON(unzipPath + '/' + filename + '.shp', destFile, function () {

            console.log('Cleaning up...');

            fs.emptyDirSync(unzipPath);
            fs.rmdir(unzipPath);
            fs.unlinkSync(srcFile);

            console.log('Done!')

            process.exit(0);
        });
    });
}

module.exports = function (mapDir) {
    return {
        doFetch: function (state, house) {
            let TIGER_URL = settings.tigerUrl;
            let filename = 'tl_2016_' + settings.states[state] + '_' + settings.houses[house].toLowerCase();
            let url = 'https://www2.census.gov/geo/tiger/TIGER2016/' + settings.houses[house] + '/' + filename + '.zip';

            console.log("Downloading '" + url + "\ ...");

            https.get(url, (res) => {
                let dir = mapDir || settings.mapDir;
                let path = dir + '/' + state + '/' + filename + '.zip';

                fs.mkdirp(dir + '/' + state, (err) => {
                    if (err) {
                        console.error('Error: ' + err.message);
                        process.exit(1);
                    }

                    res.pipe(fs.createWriteStream(path));

                    let c = 0;
                    res.on('data', () => {
                        c++;
                        if (!(c % 5))
                            process.stdout.write('.');
                    });

                    res.on('end', () => {                
                        console.log('Success!');

                        let dest = dir + '/' + state +'/' + house + '.json';                
                        extractData(path, dest);
                    })
                });
            }).on('error', (err) => {
                console.error('Error: ' + err.message);
                process.exit(1);
            });
        }
    }
}