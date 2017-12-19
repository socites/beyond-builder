module.exports = require('async')(function *(resolve, reject, library, path, layer, events) {
    "use strict";

    if (layer !== 'client' && layer !== 'server') {
        throw new Error('Invalid parameters, layer must be client or server');
    }

    if (!library.npm) {
        resolve();
        return;
    }

    let config = library.npm;
    if (config[layer]) {
        config = config[layer];
    }

    let fs = require('co-fs');
    let save = require('../fs/save');
    let copy = require('../fs/copy');

    let sources = {};
    let resources = {};

    if (typeof config.publish === 'string') {

        sources.publish = require('path').join(library.dirname, config.publish);
        if (!(yield fs.exists(sources.publish))) {
            events.emit('error', 'NPM Publish script not found on library "' + library.name + '"');
            delete sources.publish;
        }

    }

    if (typeof config.readme === 'string') {

        sources.readme = require('path').join(library.dirname, config.readme);
        if (!(yield fs.exists(sources.readme))) {
            events.emit('error', 'NPM Readme file not found on library "' + library.name + '"');
            delete sources.readme;
        }

    }

    sources.package = require('path').join(library.dirname, config.package);
    if (!(yield fs.exists(sources.package))) {
        events.emit('error', 'NPM Package does not exist on library "' + library.name + '"');
        resolve();
        return;
    }

    try {
        resources.package = require(sources.package);
    }
    catch (exc) {
        events.emit('error', 'Error opening npm package on library "' + library.name + '": ' + exc.error);
        resolve();
        return;
    }

    sources.version = require('path').join(library.dirname, config.version);
    if (!(yield fs.exists(sources.version))) {
        events.emit('error', 'NPM Version does not exist on library "' + library.name + '"');
        resolve();
        return;
    }

    try {
        resources.version = require(sources.version);
    }
    catch (exc) {
        events.emit('error', 'Error opening npm version on library "' + library.name + '": ' + exc.error);
        resolve();
        return;
    }

    let version = resources.version;
    if (typeof version !== 'object' || typeof version.version !== 'string') {
        events.emit('error', 'Invalid npm version on library "' + library.name + '"');
        resolve();
        return;
    }

    version = version.version;
    version = version.split('.');

    let minor = version.pop();
    minor = parseInt(minor) + 1;
    version.push(minor);
    version = version.join('.');

    resources.package.version = version;

    // Save the package.json file
    let target = require('path').join(path, 'package.json');
    yield save(target, JSON.stringify(resources.package));

    // Update version
    yield save(sources.version, JSON.stringify({
        'version': version
    }));

    // Save the publish script
    if (sources.publish) {

        target = require('path').join(path, 'publish.js');
        yield copy.file(sources.publish, target);

    }

    // Save the readme file
    if (sources.readme) {

        target = require('path').join(path, 'README.md');
        yield copy.file(sources.readme, target);

    }

    resolve();

});
