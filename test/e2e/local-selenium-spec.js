import {merge} from 'lodash';
import webdriverio from 'webdriverio';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

var url = 'http://localhost:3000';

const tunnelConfig = {
  desiredCapabilities: {
    'browserstack.local' : 'true',
    'browserstack.debug': 'true'
  }
};

const prodConfig = {
  host: 'hub.browserstack.com',
  port: 80,
  user : process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_API,
  logLevel: 'silent'
};

var options = {
  desiredCapabilities: {
    browserName: 'chrome'
  }
};

if(process.env.isTunnel) {
  merge(options, tunnelConfig, prodConfig);
} else if (!process.env.DEV) {
  url = 'http://www.google.com';
  merge(options, prodConfig);
}

const client = webdriverio.remote(options);


chai.use(chaiAsPromised);
chai.should();
chaiAsPromised.transferPromiseness = client.transferPromiseness;

describe('local homepage', function() {

    before(function() {
        return client.init().url(url);
    });

    it('the `title` should be "Google"', function() {
        return client.getTitle().should.become('Google');
    });

    it('check that the #viewport element is on the page', () => {
      return client.isVisible('#viewport').should.eventually.be.true;
    });

    it('check that the #viewport element has the value Up', () => {
      return client.waitUntil(() => {
        return client.getText('#viewport').then((text) => {
          return text === 'Up';
        });
      }).should.eventually.be.true;
    });

    after(function() {
        return client.end();
    });
});
