import {readdirSync as read, statSync as stat, existsSync as exists} from 'fs';
import _ from 'lodash';
import path, {join} from 'path';
import gulp from 'gulp';
import yargs from 'yargs';
import pluginFn from 'gulp-load-plugins';
import './gulp-taskname';

var argv = yargs
            .usage('Usage: $0 <gulp> $1 <gulp_task> [-e <environment> -f <file_to_test>]')
            .alias('e', 'ENV')
            .alias('p', 'port')
            .alias('f', 'file')
            .argv;

argv.isWatch = process.argv.indexOf('watch') !== -1;

const prodTasks = [
  'build'
];

/**
 * Environment defaults to `DEV` unless CLI arg -e is specified or `gulp build`
 */
if(!argv.ENV) {
  if(argv.isWatch || !_.intersection(process.argv, prodTasks).length) {
    argv.ENV = 'DEV';
  } else if (_.intersection(process.argv, prodTasks).length) {
    argv.ENV = 'PROD';
  }
}

var keys = Object.keys(argv);
const config = keys.filter((arg) => {
  //filter out alias argvs
  return arg.length > 1 && !/\$/.test(arg);
}).reduce((o, arg, i) => {
  let val = argv[arg];
  o[arg] = arg === 'ENV' ? val.toUpperCase() : val;

  return o;
}, {});

if(!config.port) {
  config.port = 8080;
}

process.env.NODE_ENV = config.ENV;

const plugins = pluginFn({
  lazy: false,
  pattern: [
    'gulp-*',
    'gulp.*',
    'del',
    'run-sequence',
    'browser-sync'
  ],
  rename: {
    'gulp-util': 'gutil',
    'gulp-if': 'gulpIf',
    'run-sequence': 'sequence'
  }
});

var getTask = (taskPath) => {
  return require(taskPath)(gulp, plugins, config);
};

/**
 * Strips dashes from string and converts the following character to uppercase
 * @param {String} potentially has dashes
 * @return {String} if string contains dashes they are stripped and following character to uppercase
 */
var dashToCamel = (str) => {
  //return str;
  var split = str.split('-');
  return split.map((item, i) => {
    if(i !== 0) {
      item = item.charAt(0).toUpperCase() + item.slice(1);
    }
    return item;
  }).join('');
};

const tasksDir = join(process.cwd(), 'gulp/tasks');
/**
 * Creates an object with keys corresponding to the Gulp task name and
 * values corresponding to the callback function passed as the second
 * argument to `gulp.task`
 * @param {Array} all fill and directory names in the `gulp/task` directory
 * @return {Object} map of task names to callback functions to be used in `gulp.task`
 */
var tasks = read(tasksDir).reduce( (o, name) => {
  let taskPath = join(tasksDir, name);
  let isDir = stat(taskPath).isDirectory();
  var taskName;
  if( isDir ) {
    if( !exists(join(taskPath, 'index.js')) ) {
      throw new Error(`task ${name} directory must have filename index.js`);
    }
    taskName = name;
  } else {
    taskName = path.basename(name, '.js');
  }
  o[ dashToCamel(taskName) ] = getTask(taskPath);
  return o;
}, {});

export default tasks;
export {config};
export {plugins};
