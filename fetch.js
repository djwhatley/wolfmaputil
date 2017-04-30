var fs = require('fs-extra');
var https = require('https');
var shp2json = require('shp2json');

var constants = require('./constants');

module.exports = function (mapDir) {
    return {
        doFetch: function (state, house, format) {            
            let TIGER_URL = constants.tigerUrl;
            let filename = 'tl_2016_' + constants.states[state] + '_' + constants.houses[house].toLowerCase();
            let url = 'https://www2.census.gov/geo/tiger/TIGER2016/' + constants.houses[house] + '/' + filename + '.zip';

            console.log("Downloading '" + url + "\ ...");

            https.get(url, (res) => {
                let dir = mapDir;
                let path = dir + '/' + state + '/' + filename + '.zip';

                fs.mkdirp(dir + '/' + state, (err) => {
                    if (err) {
                        console.error('Error: ' + err.message);
                        process.exit(1);
                    }

                    let dest = dir + '/' + state +'/' + house + '.json'

                    switch (format) {
                        case 'zip':
                            res.pipe(fs.createWriteStream(path)); 
                            break;
                        case 'json':
                        default:
                            shp2json(res).pipe(fs.createWriteStream(dest));
                            res.resume();
                            break;
                    }

                    let c = 0;
                    res.on('data', () => {
                        c++;
                        if (!(c % 5))
                            process.stdout.write('.');
                    });

                    res.on('end', () => {                
                        console.log('Success!');
                    })
                });
            }).on('error', (err) => {
                console.error('Error: ' + err.message);
                process.exit(1);
            });
        }
    }
}