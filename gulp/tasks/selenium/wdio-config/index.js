var join = require('path').join;
require('babel/register')({
  experimental: true
});

exports.config = {
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
        browserName: 'chrome'
    }],

    /**
     * test configurations
     */
    logLevel: 'silent',
    coloredLogs: true,
    waitforTimeout: 10000,
    framework: 'mocha',

    reporter: 'spec',

    mochaOpts: {
        ui: 'bdd',
        require: [
          join(process.cwd(), 'gulp/config/babelhook')
        ]
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
