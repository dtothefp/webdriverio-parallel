import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

export default function() {
  chai.use(chaiAsPromised);
  chai.should();
  chaiAsPromised.transferPromiseness = global.browser.transferPromiseness;

  return process.env.WDIO_CLI ? global.browser : global.browser.init();
}
