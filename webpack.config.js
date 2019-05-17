const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: path.resolve(__dirname, 'src/index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[hash].js',
        publicPath: '/'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'graph',
            template: path.resolve(__dirname, 'src/index.html')
        })
    ],
    devServer: {
        contentBase: './dist',
        port: '8580',
        host: '0.0.0.0',
        hot: true,
        overlay: {  //显示错误提示
            errors: true
        },
    }
};
