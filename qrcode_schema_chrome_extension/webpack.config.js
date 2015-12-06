var path = require("path");
// For conveniance we create variable that holds the directory to bower_components
var bower_dir = __dirname + '/bower_components';

module.exports = {
    entry: "./app/src/js/entry.js",
    // The resolve.alias object takes require expressions
    // (require('react')) as keys and filepath to actual
    // module as values
    resolve: {
        alias: {
            'react': bower_dir + '/react/react.min.js'
        }
    },
    output: {
        path: path.join(__dirname, "app/scripts"),
        filename: "main.js"
    },
    module: {
        // There is no reason for WebPack to parse this file
        noParse: [bower_dir + '/react/react.min.js'],
        loaders: [{
                test: /\.css$/,
                loader: "style!css"
            },
            // required for react jsx
            {
                test: /\.js$/,
                loader: "jsx-loader"
            }
        ]
    }
};
