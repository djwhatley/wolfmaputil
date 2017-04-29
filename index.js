var fs = require('fs-extra');
var https = require('https');

var settings = require('./settings');

var doFetch = function () {
    let state = process.argv[3];
    if (!state || !settings.states[state.toLowerCase()]) {
        console.error('Error: Invalid argument for \'state/territory\': ' + state);
        process.exit(1);
    }
    state = state.toLowerCase();

    let house = process.argv[4];
    if (!house || !settings.houses[house.toLowerCase()]) {
        console.error('Error: Invalid argument for \'house\': ' + house);
        process.exit(1);
    }
    house = house.toLowerCase();

    let TIGER_URL = settings.tigerUrl;


    let url = 'https://www2.census.gov/geo/tiger/TIGER2016/' + settings.houses[house] + '/tl_2016_' + settings.states[state] + '_' + settings.houses[house].toLowerCase() + '.zip';


    console.log('Downloading \'' + url + '\' ...');

    https.get(url, (res) => {
        let filename = 'geo/' + state +'/' + house + '.zip';

        fs.mkdirp('geo/' + state, (err) => {
            if (err) {
                console.error('Error: ' + err.message);
                process.exit(1);
            }

            res.pipe(fs.createWriteStream(filename));

            res.on('end', () => {
                console.log('Success!');
                //console.log('Retrieved ' + state.toUpperCase() + '')
                process.exit(0);
            })
        });
    }).on('error', (err) => {
        console.error('Error: ' + err.message);
        process.exit(1);
    });
};

var showHelp = function () {

};


var cmd = process.argv[2];
if (!cmd) {
    console.error('Error: No command specified! Use \'help\' to get help.');
    process.exit();
} else {
    cmd = cmd.toLowerCase();
    switch (cmd) {
        case 'help':
            showHelp();
            break;
        case 'fetch':
            doFetch();
            break;        
        default:
            console.error('Error: Invalid command: ' + cmd);
            process.exit(1);
            break;
    }
}

