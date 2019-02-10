/*
    ./webpack.config.js
*/
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  resolve: {
    extensions: ['.js', '.jsx', '.scss'],
  },
  entry: './client/index.js',
  output: {
    path: path.resolve('dist'),
    filename: 'index_bundle.js',
  },
  devtool: 'sourcemap',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|MidiSheetMusic)/,
        use: [
          {
            loader: 'babel-loader',
            query: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
              plugins: ['@babel/plugin-proposal-class-properties'],
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      {
        include: path.resolve(
          __dirname,
          'client/external/MidiSheetMusic/build'
        ),
        test: /\.js$/,
        parser: { system: false },
        use: [ 'script-loader' ]
      },
      {
        test: /\.(png|jpg|gif|mid)$/,
        use: [
          {
            loader: 'file-loader',
            options: {},
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './client/index.html',
      filename: 'index.html',
      inject: 'body',
    }),
  ],
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
};
