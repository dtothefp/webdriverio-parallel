var merge = require('lodash').merge;
var join = require('path').join;
require('babel/register')({
  experimental: true
});

var config = {

  /**
   * specify test files
   */
  specs: [
    'test/e2e/wdio*.js'
  ],

  /**
   * capabilities
   */
  capabilities: [{
    browserName: 'firefox'
  },
  {
    browserName: 'chrome'
  }],

  /**
   * test configurations
   */
  logLevel: 'silent',
  coloredLogs: true,
  baseUrl: 'http://localhost:3000',
  waitforTimeout: 10000,
  framework: 'mocha',

  reporter: 'spec',
  reporterOptions: {
    outputDir: './'
  },

  mochaOpts: {
    ui: 'bdd'
  },

  /**
   * hooks
   */
  onPrepare: function() {
    console.log('WDIO CLI test runner starting');
  },
  onComplete: function() {
    console.log('WDIO CLI test runner finished');
  }

};

var tunnelConfig = {
  host: 'hub.browserstack.com',
  port: 80,
  user : process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_API,
};

var remoteConfig = {
  host: 'hub.browserstack.com',
  port: 80,
  baseUrl: 'https://dtothefp.github.io/webdriverio-parallel',
  user : process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_API,
  logLevel: 'silent'
};

if(process.env.TUNNEL) {
  config.capabilities.push({
    browserName: 'ie'
  });

  config.capabilities.forEach(function(o) {
    var addCaps = {
      'browserstack.local' : 'true',
      'browserstack.debug': 'true'
    };
    merge(o, addCaps);
  });
  merge(config, tunnelConfig);
} else if(process.env.REMOTE) {
  config.capabilities.push({
    browserName: 'ie'
  });

  config.capabilities.forEach(function(o) {
    var addCaps = {
      'browserstack.debug': 'true'
    };
    merge(o, addCaps);
  });

  merge(config, remoteConfig);
}

exports.config = config;
