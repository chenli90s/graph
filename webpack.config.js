const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: path.resolve(__dirname, 'src/index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[hash].js',
        chunkFilename: '[name].[chunkhash:8].js',
        publicPath: '/'
    },
    // stats: { children: false },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                loaders: 'babel-loader',
                include: path.resolve(__dirname, 'src'),
                exclude: /node_modules/
            },
            {
                test: /\.css$/, // 针对 .css 后缀的文件设置 loader
                use: ['style-loader', 'css-loader'] // 使用 loader
            },
            {
                test: /\.(eot|woff2?|ttf|svg|png)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: '[name]-[hash:5].min.[ext]',
                            limit: 5000, // fonts file size <= 5KB, use 'base64'; else, output svg file
                            publicPath: 'fonts/',
                            outputPath: 'fonts/'
                        }
                    }
                ]
            }
        ]
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
