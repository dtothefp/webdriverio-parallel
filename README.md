#### Gulp Boilerplate E2E testing with  webdriverio and BrowserStack

#### Setup
- ensure you are on `node v0.12` or later
- go to [Browserstack](https://www.browserstack.com) and create an accout
- go to [Browserstack Automate](https://www.browserstack.com/automate) and copy `username` and `key`
- in `.bash_profile` or `.zshrc`
- when you first run `gulp selenium` you may be prompted to download the [JAVA Runtime](https://support.apple.com/kb/DL1572?locale=en_US)
- install [JAVA Runtime](https://support.apple.com/kb/DL1572?locale=en_US) specific for [Yosemite](http://fredericiana.com/2014/10/21/osx-yosemite-java-runtime-environment/)
```shell
export BROWSERSTACK_USERNAME='<username>'
export BROWSERSTACK_API='<key>'
```

#### Getting Started
```shell
npm -g uninstall gulp --save
npm -g i gulp#3.9 // ensure the version is 3.9
npm i
gulp // runs dev build (lints files, starts webpack-dev-server, opens webpage at localhost:3001) with livereload for JS
gulp -e prod // runs prod build => uglifies JS
```

#### Gulp Tasks
```shell
gulp selenium // run e2e tests from local selenium server => must have local server running
gulp selenium:tunnel // run e2e tests from BrowserStack selenium server using local IP => must have local server running
gulp selenium -e prod // run e2e tests from BrowserStack selenium server using hosted IP
```

#### Cool Stuff
- [webdriverio](http://webdriver.io/) drives our selenium tests, promise or es6 generator API
- [WD](http://admc.io/wd/) another hipster webdriver client
- when running gulp selenium:tunnel can [Live](https://www.browserstack.com/start) view local site in various browsers on BrowserStack
- some links that helped me integrate WebriverIO with BrowserStack

https://github.com/browserstack/automate-node-samples/blob/master/LocalSample.js
https://github.com/webdriverio/webdriverio/issues/551

## Testing Philosophies
![](https://www-static2.strongloop.com/wp-content/uploads/2015/03/975x703xpyramid.png.pagespeed.ic.Ozn480glOj.png)

#### TODO:
- add task strictly for opening BrowserStack tunnel for Live viewing
- add environmental specific eslint rules
- probably lots of other stuff
