var path = require('path');
module.exports = {
    entry: "./src/entry.js",
    output: {
        path: path.join(__dirname, 'out'),
        publicPath: './out',
        filename: 'bundle.js'
    },
    externals: {
        'react': 'React'
    },
    module: {
        loaders[
            { test: /\.js$/, loader: 'jsx!babel', include: /src/ },
            { test: /\.css$/, loader: 'style!css'},
            { test: /\.scss$/, loader: 'style!css!sass'},
            { test: /\.(jpg|png)$/, loader: 'url?limit=8192'}
        ]
    }
};
