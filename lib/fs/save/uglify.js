module.exports = function (file, content) {

    if (!global.compress) return content;

    const extname = require('path').extname(file);

    if (['.html', '.htm'].includes(extname)) {

        const minify = require('html-minifier').minify;

        let result;
        try {
            result = minify(content, {
                'removeComments': true
            });
        }
        catch (exc) {
            console.warn(`Error minifying file "${file}"`, exc.message);
            return content;
        }

        return result;

    }
    else if (extname === '.js') {

        const minify = require('uglify-es').minify;

        let result = minify(content);
        if (result.error) {
            console.warn(`Error minifying file "${file}"`, result.error);
        }

        return (result.error) ? content : result.code;

    }
    else if (extname === '.css') {

        // Minify css if required
        let cleaned = new (require('clean-css'))().minify(content);
        if (cleaned.errors.length || cleaned.warnings.length) {

            for (let error of cleaned.errors) {
                console.log(`Error on css file "${file}": ${error}`);
            }
            for (let warning of cleaned.warnings) {
                console.log(`Warning on css file "${file}": ${warning}`);
            }

            return content;

        }

        return cleaned.styles;

    }
    else {
        return content;
    }

};
