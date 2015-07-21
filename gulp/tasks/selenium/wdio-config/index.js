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
      browserName: 'ie'
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
        console.log('let\'s go');
    },
    onComplete: function() {
        console.log('that\'s it');
    }

};

var tunnelConfig = {
  host: 'hub.browserstack.com',
  port: 80,
  user : process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_API,
};

if(process.env.TUNNEL) {
  config.capabilities.forEach(function(o) {
    var tunnelCaps = {
      'browserstack.local' : 'true',
      'browserstack.debug': 'true'
    };
    merge(o, tunnelCaps);
  });

  merge(config, tunnelConfig);
}

exports.config = config;
