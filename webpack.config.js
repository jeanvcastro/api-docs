const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: "none",
    entry: './src/app.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'style.css'
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.(sa|sc|c)ss$/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        'sass-loader'
      ]
            }
        ]
    }
};