import * as path from 'path';

import HtmlWebpackPlugin = require('html-webpack-plugin');
import yargs = require('yargs');
import webpack = require('webpack');
import {AotPlugin} from '@ngtools/webpack';
import {CheckerPlugin} from 'awesome-typescript-loader';

const isDebug = yargs.argv.d || yargs.argv.debug;

module.exports = function (env) {
  const config = {
    entry: {
      styles: './src/styles/main.less',
      vendor: './src/vendor.ts',
      main: './src/index.ts'
    },

    output: {
      publicPath: '/',
      path: path.resolve(__dirname, 'www'),
      filename: '[name]-[chunkhash].js'
    },

    module: {
      rules: [
        {
          test: /\.html$/,
          loader: 'raw-loader'
        },
        {
          test: /\.css$/,
          loaders: [
            'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.less$/,
          loaders: [
            'style-loader',
            'css-loader',
            'less-loader'
          ]
        },
        {
          test: /\.(jpg|ttf|svg|eot|woff(2)?)(\?[a-z0-9]+)?$/,
          loader: 'file-loader',
          query: {
            // Note: Using [path][name].[ext] fails on android devices
            name: '[name]-[hash].[ext]'
          }
        }
      ]
    },

    plugins: [
      new CheckerPlugin(),
      new HtmlWebpackPlugin({
        template: './src/index.ejs'
      }),
      new webpack.optimize.CommonsChunkPlugin({ names: ['vendor'] }),
      new webpack.ContextReplacementPlugin(
        // The (\\|\/) piece accounts for path separators in *nix and Windows
        /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
        root('./src'), // location of your src
        {}
      )
    ],

    resolve: {
      extensions: ['.ts', '.js']
    },

    devServer: {
      port: 8080,
      stats: 'minimal'
    },

    performance: {
      hints: !isDebug && 'warning'
    }
  };

  return isDebug
    ? toDevelopment(config)
    : toProduction(config);
};

function toProduction(config) {
  return {
    ...config,
    module: {
      ...config.module,
      rules: config.module.rules.concat([
        {
          test: /\.ts$/,
          loaders: ['@ngtools/webpack']
        }
      ])
    },
    plugins: config.plugins.concat([
      new AotPlugin({
        tsConfigPath: path.resolve(__dirname, 'tsconfig.json'),
        entryModule: './src/app/app.module#AppModule'
      })
    ])
  };
}

function toDevelopment(config) {
  return {
    ...config,
    module: {
      ...config.module,
      rules: config.module.rules.concat([
        {
          test: /\.ts$/,
          loaders: [
            'awesome-typescript-loader',
            'angular2-template-loader'
          ]
        }
      ])
    }
  }
}

function root(__path) {
  return path.join(__dirname, __path);
}
