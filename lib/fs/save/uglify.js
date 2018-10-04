module.exports = function (file, content) {

    if (!global.compress) return content;

    const extname = require('path').extname(file);

    if (['.html', '.htm'].includes(extname)) {

        const minify = require('html-minifier').minify;

        let result;
        try {
            result = minify(content, {
                'removeAttributeQuotes': true,
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
    else {
        return content;
    }

};
