import {merge} from 'lodash';
import setup from '../config/e2e-setup';

var url = '/';

describe('local homepage parallel', function() {
  let client;

  before(function() {
    client = setup();
    return client.url(url);
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

