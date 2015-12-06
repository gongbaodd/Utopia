module.exports = {
    entry: './src/app.js',
    output: {
        filename: './prd/app.js'
    },
    module: {
        {
            test: /\.js$/,
            loader: 'babel-loader'
        },{
            test: /\.css$/,
            loader: 'style-loader!css-loader'
        }
    }
}
