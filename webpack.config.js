const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        list: './media/src/list.js'
    },
    output: {
        filename: '[name].js', //chunkFilename: '[name].[chunkhash].js',
        chunkFilename: '[name].[chunkhash].js', //chunkFilename: '[name].[chunkhash].js',
        path: path.resolve(__dirname, 'media/dist'),
        publicPath: '/media/dist/'
    }
};