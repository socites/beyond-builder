require('colors');

module.exports = require('async')(function *(resolve, reject, module, json, path, events) {
    "use strict";

    if (!module.config.start) {
        resolve();
        return;
    }

    let copy = require('../../../../fs/copy');

    json.start = module.config.start;

    let processors = module.config.start;
    for (let name in processors) {

        let processor = processors[name];
        let files = (typeof processor === 'string') ? [processor] : processor.files;
        files = (typeof files === 'string') ? [files] : files;

        if (!(files instanceof Array)) {
            continue;
        }

        for (let file of files) {

            let source = require('path').join(
                module.dirname,
                (processor.path) ? processor.path : './',
                file);

            let target = (module.path === '.') ? 'main' : module.path;
            target = require('path').join(
                path,
                target,
                (processor.path) ? processor.path : './',
                file);

            yield copy.recursive(source, target);

        }

    }

    resolve();

});
