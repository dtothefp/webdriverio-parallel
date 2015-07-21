import {join, resolve} from 'path';
import webpack from 'webpack';
import eslintConfig from '../eslint/eslint-config';
import formatter from 'eslint-friendly-formatter';

export default function(opts) {
  var {ENV, isTest, port} = opts;
  let rules = eslintConfig({
    ENV
  });
  const isDev = ENV === 'DEV';
  var plugins = [
    new webpack.ProvidePlugin({
      'fetch': 'imports?this=>global!exports?global.fetch!isomorphic-fetch',
      'window.fetch': 'imports?this=>global!exports?global.fetch!isomorphic-fetch',
      'global.fetch': 'imports?this=>global!exports?global.fetch!isomorphic-fetch'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: process.env.NODE_ENV
      }
    })
  ];

  var devPlugins = [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ];

  var prodPlugins = [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: false
      },
      compress: {
        warnings: false
      }
    })
  ];

  var devEntry = [
    `webpack-dev-server/client?http://localhost:${port}`,
    'webpack/hot/dev-server'
  ];

  var src = [
    join(process.cwd(), 'src/index.js')
  ];

  var preLoaders = [
    {
      test: /\.js$/,
      loader: `eslint-loader`,
      exclude: /node_modules/
    }
  ];

  var loaders = [
    {
      test: /\.js?$/,
      exclude: /node_modules(?!\/isomorphic-fetch\/node_modules)(?!\/whatwg-fetch).*/,
      loader: 'babel?optional[]=runtime'
    },
    {
      test: /\.json$/,
      loader: 'json'
    }
  ];

  var config = {
    entry:  src,
    output: {
      path: join(process.cwd(), 'dist/js'),
      publicPath: '/js/',
      filename: '[name].js'
    },
    eslint: {
      rules,
      configFile: resolve(__dirname, '..', 'eslint/es6-config.json'),
      formatter,
      emitError: true,
      emitWarning: true,
      failOnWarning: true,
      failOnError: true
    },
    module: {
      preLoaders: preLoaders,
      loaders: loaders
    },
    resolve: {
      alias: {
        fetch: 'isomorphic-fetch'
      }
    },
    plugins: plugins
  };

  var concatArr = (configArr, add) => {
    return configArr.push.apply(configArr, add);
  };

  if(isDev) {
    concatArr(config.entry, devEntry);
    config.devtool = 'eval';
    concatArr(config.plugins, devPlugins);
  } else {
    concatArr(config.plugins, prodPlugins);
    config.devtool = '#inline-source-map';
  }

  return config;
}
