import {merge} from 'lodash';
import selenium from 'selenium-standalone';

var config = {
  // check for more recent versions of selenium here:
  // http://selenium-release.storage.googleapis.com/index.html
  baseURL: 'http://selenium-release.storage.googleapis.com',
  drivers: {
    chrome: {
      // check for more recent versions of chrome driver here:
      // http://chromedriver.storage.googleapis.com/index.html
      version: '2.15',
      arch: process.arch,
      baseURL: 'http://chromedriver.storage.googleapis.com'
    }
  },
  logger(message) {
    console.log(message);
  },
  progressCb(totalLength, progressLength, chunkLength) {

  }
};

export default function(opts, cb) {
  console.log('OPTS', opts);
  if(typeof opts === 'function') {
    cb = opts;
    opts = {};
  }
  merge(config, opts);
  console.log('OPTS', opts);
  selenium.install(config, cb);
}

