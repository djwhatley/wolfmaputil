var request = require('request');

request('https://openstates.org/api/v1/districts/ga/', (err, res, body) => {
    if (err) {
        console.error(err);
    }

    if (res) {
        console.log(res.statusCode);
    }

    if (body) {
        console.log(body);
    }
});
