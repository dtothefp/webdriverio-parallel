import webdriverio from 'webdriverio';
import {join} from 'path';
import _, {merge} from 'lodash';
import BrowserStackTunnel from 'browserstacktunnel-wrapper';
import selenium from 'selenium-standalone';
import install from './install';

export default function(gulp, plugins, config) {
  const babelPath = join(process.cwd(), 'gulp/config/babelhook');
  const SELENIUM_VERSION = '2.46.0';
  var {mocha, gutil} = plugins;
  var {PluginError} = gutil;
  var {ENV, file, port, isWatch} = config;
  file = file || '**/*-spec';
  var isDev = ENV === 'DEV';
  var src =  join(process.cwd(), 'test/e2e/', `${file}.js`);

  function runMocha(cb) {
    return gulp.src([
      src
    ])
    .pipe(mocha({
      timeout: 40000,
      require: [ babelPath ]
    }))
    .once('error', cb)
    .once('end', cb);
  }

  function runWebdriver (opts) {
    global.browser = webdriverio.remote(opts);
    gutil.log(gutil.colors.magenta(`Starting Tests at Base URL of ${opts.baseUrl}`));
  }

  function killTunnel(instance, cb) {
    instance.stop(function(error) {
      if (error) {
        gutil.log(error);
      }
      cb();
    });
  }

  const tunnelConfig = {
    desiredCapabilities: {
      'browserstack.local' : 'true',
      'browserstack.debug': 'true'
    },
    host: 'hub.browserstack.com',
    port: 80,
    user : process.env.BROWSERSTACK_USERNAME,
    key: process.env.BROWSERSTACK_API,
    logLevel: 'silent'
  };

  const remoteConfig = {
    host: 'hub.browserstack.com',
    port: 80,
    baseUrl: 'http://hrc.dev.thegroundwork.com',
    user : process.env.BROWSERSTACK_USERNAME,
    key: process.env.BROWSERSTACK_API,
    logLevel: 'silent'
  };

  var options = {
    desiredCapabilities: {
      browserName: 'chrome'
    },
    baseUrl: `http://site.local.thegroundwork.com:${port}`
  };

  return (cb) => {
    //switch the params is the test is not bound
    let testType = gulp.currentTask.name.split(':').splice(-1)[0];

    if(testType === 'tunnel' && isDev) {
      /**
       * gulp selenium:tunnel
       * Start a Browserstack tunnel to allow using local IP's for
       * Browserstack tests (Automate) and live viewing (Live)
       */
      process.env.isTunnel = true;
      merge(options, tunnelConfig);
      runWebdriver(options);

      let browserStackTunnel = new BrowserStackTunnel({
        key: process.env.BROWSERSTACK_API,
        hosts: [{
          name: 'site.local.thegroundwork.com',
          port: 8000,
          sslFlag: 0
        }],
        v: true,
        //important to omit identifier
        //localIdentifier: 'my_tunnel', // optionally set the -localIdentifier option
        forcelocal: true
      });

      browserStackTunnel.on('started', () => {
        gutil.log(browserStackTunnel.stdoutData);
      });

      browserStackTunnel.start(function(error) {
        if (error) {
          gutil.log('[tunnel start]', error);
        } else {
          if(testType !== 'live') {
            runMocha((param) => {
              killTunnel(browserStackTunnel, () => {
                if(param && param.message) {
                  gutil.log(`Mocha e2e Error: ${param.message}`);
                }
                process.exit();
                cb();
              });
            });
          } else {
            gutil.log('Visit BrowserStack Live to QA: https://www.browserstack.com/start');
          }
        }
      });
    } else if(isDev) {
      install({
        version: SELENIUM_VERSION
      }, () => {
        selenium.start({
          spawnOptions: {
            version: SELENIUM_VERSION,
            stdio: 'ignore'
          }
        }, (err, child) => {
          if(err) {
            throw new PluginError({
              plugin: '[selenium]',
              message:  `${err.message} => ps aux | grep selenium and kill process id`
            });
          }

          runWebdriver(options);
          runMocha((param) => {
            if(param && param.message) {
              gutil.log(`Mocha e2e Error: ${param.message}`);
            }
            child.kill();
            cb();
          });

        });
      });
    } else {
      merge(options, remoteConfig);
      runWebdriver(options);
      runMocha(cb);
    }
  };
}
