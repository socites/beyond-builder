require('colors');
module.exports = require('async')(function* (resolve, reject, path, events) {
    'use strict';

    let fs = require('co-fs');

    let exists = yield fs.exists(path);
    if (exists) {
        resolve();
        return;
    }

    let sep = require('path').sep;
    let folders = path.split(sep);

    if (sep === '\\') {
        path = folders.shift();
    }
    else {
        path = '/';
    }

    for (let i in folders) {

        if (!folders.hasOwnProperty(i)) continue;
        path = require('path').join(path, folders[i]);

        let exists = yield fs.exists(path);
        if (exists) continue;

        try {
            yield fs.mkdir(path);
        }
        catch (exc) {

            // If errno is -17 (iOS), -4075 (Windows), the directory already exists, avoid to show an error
            if ([-17, -4075].indexOf(exc.errno) !== -1) {

                let error = 'error creating directory: ' + exc.errno + ': ' + exc.message;
                if (events) {
                    events.emit(error);
                }

                throw new Error(error);

            }

        }

    }

    resolve();

});
