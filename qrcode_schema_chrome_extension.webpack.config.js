var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: "./app/src/js/entry.js",
    output: {
        path: path.join(__dirname,"app/scripts"),
        filename: "main.js"
    },
    plugins: [
        new webpack.ProvidePlugin({
            riot: 'riot'
        })
    ],
    module: {
        preLoaders: [
            {
                test: /\.tag$/,
                exclude: /node_modules/,
                loader: 'riotjs-loader',
                query: {
                    type: 'none'
                }
            }
        ],
        loaders: [
            {
                test: /\.scss$/,
                loaders: ["style","css","scss"]
            },{
                test: /\.js|\.tag|\.es6$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    }
}
