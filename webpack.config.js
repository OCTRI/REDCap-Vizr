/* eslint-env node */
const path = require('path');
const webpack = require('webpack');

const packageJson = require('./package.json');
const repoInfo = require('git-repo-info')();

const { DefinePlugin } = webpack;
const { VueLoaderPlugin } = require('vue-loader');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');

module.exports = {
  externals: {
    jquery: 'jQuery'
  },
  entry: {
    app: [
      __dirname + '/node_modules/babel-polyfill/dist/polyfill.js',
      './js/vue-main.js'
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['.js', '.vue', '.json']
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'assets/bundle.[chunkhash].js'//,
    // libraryTarget: 'var',
    // library: 'Vizr'
  },
  module: {
    noParse: [/\/babel-polyfill\/dist\/polyfill\.js$/],
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['env']
        }
      },
      {
        test: /\.css$/,
        use: ExtractTextWebpackPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader']
        })
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        loader: 'file-loader',
        options: {
          name: 'assets/[name].[hash].[ext]'
        }
      }
    ]
  },
  devtool: 'cheap-source-map',
  plugins: [
    new DefinePlugin({
      VIZR_VERSION: JSON.stringify(packageJson.version),
      VIZR_GIT_HASH: JSON.stringify(repoInfo.abbreviatedSha)
    }),
    new VueLoaderPlugin(),
    new CopyWebpackPlugin([
      '*.md',
      'LICENSE',
      'index.php',
      'Vizr.php',
      'config.json',
      'lib/**/*.php'
    ]),
    new HtmlWebpackPlugin({
      template: 'lib/main.tmpl',
      filename: 'lib/main.php',
      hash: false,
      inject: false
    }),
    new ExtractTextWebpackPlugin({
      filename: 'assets/vizr.[contenthash].css'
    })
  ]
};
