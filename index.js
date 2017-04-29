var fs = require('fs-extra');
var https = require('https');


var settings = require('./settings');


var doFetch = function (state, house) {
    let TIGER_URL = settings.tigerUrl;
    let filename = 'tl_2016_' + settings.states[state] + '_' + settings.houses[house].toLowerCase();
    let url = 'https://www2.census.gov/geo/tiger/TIGER2016/' + settings.houses[house] + '/' + filename + '.zip';

    console.log('Downloading \'' + url + '\' ...');

    https.get(url, (res) => {
        let filename = 'geo/' + state +'/' + house + '.zip'

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

var showList = function () {
    let dir = argv.m || settings.mapDir;
    console.log("Listing map data in '" + dir + "/' ...");
    
    let list = [];

    let states = fs.readdirSync(dir);
    for (let s of states) {
        let houses = fs.readdirSync(dir + '/' + s);

        let hs = [];
        for (let h of houses)
            hs.push(h.split('.')[0])

        list.push({
            state: s.toUpperCase(),
            houses: hs
        });
    }

    console.log('');
    for (let item of list) {
        let l = item.houses.indexOf('lower') > -1,
            u = item.houses.indexOf('upper') > -1;
        let i = '';
        if (l)
            i += 'lower'
        if (l & u) 
            i += ' & '
        if (u) 
            i += 'upper'
        
        console.log('- ' + item.state + ': ' + i);
    }
};

let codes = '';
let keys = Object.keys(settings.states).sort((a, b) => a < b ? -1 : (a > b ? 1 : 0));
let c = 0;
for (let key of keys) {
    codes += key.toUpperCase();
    c++;
    if (c != keys.length)
        codes += ', ';
}

var yargs = require('yargs')
    .usage('Usage: $0 <state> <house> [options]\n\nParameters:\n  state:      ANSI code of state/territory (see below)\n  house:      Which house of the legislature (lower|upper)')
    .help('h').alias('h', 'help')
    .boolean('l').alias('l', 'list').describe('l', 'List currently downloaded maps')
    .alias('m', 'mapDir').describe('m', 'Location of map data (overrides setting)').default('m', settings.mapDir)
    .boolean('v').alias('v', 'verbose').describe('v', 'Show verbose output')
    .epilog('Valid state/territory codes:\n' + codes) , argv = yargs.argv;    

if (argv.l) {
    showList();
    process.exit();
}

if (argv._.length < 2) {
    console.error('Error! Not enough arguments: got ' + argv._.length + ' but expected 2.\n')
    yargs.showHelp();
    process.exit();
}

let s = argv._[0].toLowerCase();
let h = argv._[1].toLowerCase();

if (!settings.states[s]) {
    console.error('Error! Invalid state: \'' + argv._[0] + '\'. Use -l option to list valid codes');
    process.exit();
}

if (!settings.houses[h]) {
    console.error('Error! Invalid house: \'' + argv._[1] + '\'. Valid options are (lower|upper)');
    process.exit();
}

console.log('Everything looks good: ')
console.dir(argv._);

doFetch(s, h);