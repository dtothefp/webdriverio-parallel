import {join} from 'path';
import webpack from 'webpack';
import {merge} from 'lodash';
import WebpackDevServer from 'webpack-dev-server';
import makeConfig from './make-config';

export default function(gulp, plugins, config) {
  const port = 3001;
  var {ENV} = config;
  var {gutil} = plugins;
  const isDev = ENV === 'DEV';
  let {PluginError} = gutil;

  return (cb) => {
    var webpackConfig = makeConfig(merge({}, config, {
      port
    }));
    const compiler = webpack(webpackConfig);

    compiler.plugin('compile', () => {
      gutil.log(`Webpack Bundling...`);
    });

    compiler.plugin('done', (stats) => {
      gutil.log(`Webpack Bundled in ${stats.endTime - stats.startTime}ms`);

      if (stats.compilation.errors && stats.compilation.errors.length) {
        stats.compilation.errors.forEach((err) => gutil.log(err.message));
        if(ENV !== 'DEV') {
          process.exit(1);
        }
      }

      //avoid multiple calls of gulp callback
      if(cb) {
        let gulpCb = cb;
        cb = null;
        if(isDev) {
          gutil.log(`[webpack-dev-server] listening on ${port}`);
        }

        gulpCb();
      }
    });

    const logger = (err, stats) => {
      if(err) {
        throw new new gutil.PluginError({
          plugin: `[webpack]`,
          message: err.message
        });
      }

      if(!isDev) {
        gutil.log(stats.toString());
      }
    };

    if(ENV === 'DEV') {
      /**
       * If we are not developing the `cms` site or if it is a head-script compile without the webpack dev server
       */
      new WebpackDevServer(compiler, {
        publicPath: webpackConfig.output.publicPath,
        hot: true,
        quiet: true,
        noInfo: true,
        watchOptions: {
          aggregateTimeout: 300,
          poll: 1000
        },
        headers: { 'X-Custom-Header': 'yes' },
        stats: { colors: true }
      }).listen(port, 'localhost', () => {});
    } else {
      compiler.run(logger);
    }
  };
}
