import {merge} from 'lodash';

export default function(opts) {
  function mergeConfig(parent, child) {
    return merge({}, parent, child);
  }
  var {ENV} = opts;
  let isDev = ENV === 'DEV';
  let rules = {
    'strict': 0,
    'no-underscore-dangle': 0,
    'no-unused-vars': 0,
    'curly': 0,
    'no-multi-spaces': 0,
    'key-spacing': 0,
    'no-return-assign': 0,
    'consistent-return': 0,
    'no-shadow': 0,
    'no-comma-dangle': 0,
    'no-process-exit': 0,
    'handle-callback-err': 0,
    'no-use-before-define': 0,
    'no-unused-expressions': 0,
    'no-empty': 0,
    'new-parens': 0,
    'no-cond-assign': 0,
    'quotes': [1, 'single', 'avoid-escape'],
    'camelcase': 0,
    'new-cap': [1, { 'capIsNew': false }],
    'no-undef': 2
  };
  let devRules = {
    'no-debugger': 0
  };
  let prodRules = {};

  return isDev ? mergeConfig(rules, devRules) : mergeConfig(rules, devRules);
}
