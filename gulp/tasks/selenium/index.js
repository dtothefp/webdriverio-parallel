import webdriverio from 'webdriverio';
import {join} from 'path';
import _, {merge} from 'lodash';
import BrowserStackTunnel from 'browserstacktunnel-wrapper';
import selenium from 'selenium-standalone';
import install from './install';
import spawn from './spawn-process';

export default function(gulp, plugins, config) {
  const babelPath = join(process.cwd(), 'gulp/config/babelhook');
  const SELENIUM_VERSION = '2.46.0';
  var {mocha, gutil} = plugins;
  var {PluginError} = gutil;
  var {ENV, file, isWatch} = config;
  var port = 3000;
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

  function runWebdriver (opts, task, env) {
    if(task === 'parallel') {
      let opts = {};
      opts[env] = true;
      gutil.log(gutil.colors.magenta(`Starting Parallel Tests for ${env}`));
      return spawn(opts);
    } else {
      global.browser = webdriverio.remote(opts);
      gutil.log(gutil.colors.magenta(`Starting Tests at Base URL of ${opts.baseUrl}`));
    }
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
    baseUrl: `localhost:${port}`
  };

  return (cb) => {
    //switch the params is the test is not bound
    let split = gulp.currentTask.name.split(':');
    let task = split.splice(-1)[0];
    let wdioCli = false;

    if(task === 'parallel') {
      wdioCli = true;
      if(split[1] === 'tunnel') {
        task = 'tunnel';
      }
    }

    if(task === 'tunnel' && isDev) {
      /**
       * gulp selenium:tunnel
       * Start a Browserstack tunnel to allow using local IP's for
       * Browserstack tests (Automate) and live viewing (Live)
       */
      process.env.isTunnel = true;
      merge(options, tunnelConfig);
      runWebdriver(options, task);

      let browserStackTunnel = new BrowserStackTunnel({
        key: process.env.BROWSERSTACK_API,
        hosts: [
          {
            name: 'localhost',
            port: 3000,
            sslFlag: 0
          },
          {
            name: 'localhost',
            port: 8080,
            sslFlag: 0
          }
        ],
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
          if(task !== 'live') {
            if(wdioCli) {
              let cp = runWebdriver(options, 'parallel', 'tunnel');

              cp.on('close', (code) => {
                `Child process closed status: ${code}`;
                child.kill();
                process.exit(code);
              });
            } else {
              runMocha((param) => {
                killTunnel(browserStackTunnel, () => {
                  if(param && param.message) {
                    gutil.log(`Mocha e2e Error: ${param.message}`);
                  }
                  process.exit();
                  cb();
                });
              });
            }
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

          let cp = runWebdriver(options, task);

          if(!wdioCli) {
            runMocha((param) => {
              if(param && param.message) {
                gutil.log(`Mocha e2e Error: ${param.message}`);
              }
              if(typeof cb === 'function') {
                let gulpCb = cb;
                cb = null;
                child.kill();
                gulpCb();
              }
            });
          } else {
            cp.on('close', (code) => {
              `Child process closed status: ${code}`;
              child.kill();
              process.exit(code);
            });
          }
        });
      });
    } else {
      merge(options, remoteConfig);
      let cp = runWebdriver(options, task, 'remote');
      if(!wdioCli) {
        runMocha(cb);
      } else {
        cp.on('close', (code) => {
          `Child process closed status: ${code}`;
          cb();
        });
      }
    }
  };
}
