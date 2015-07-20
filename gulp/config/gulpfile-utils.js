import {readdirSync as read, statSync as stat, existsSync as exists} from 'fs';
import _ from 'lodash';
import path, {join} from 'path';
import yargs from 'yargs';
import gulp from 'gulp';
import pluginFn from 'gulp-load-plugins';
var config = {};

gulp.Gulp.prototype.__runTask = gulp.Gulp.prototype._runTask;
gulp.Gulp.prototype._runTask = function(task) {
  this.currentTask = task;
  this.__runTask(task);
}

var argv = yargs
            .usage('Usage: $0 <gulp> $1 <gulp_task> [-e <environment> -f <file_to_test>]')
            .alias('e', 'env')
            .alias('f', 'file')
            .argv;

//TODO: remove this and adjust in webpack config
if(process.argv.indexOf('test') !== -1) {
  argv.isTest = true;
}

var args = Object.keys(argv);
var cliConfig = args.reduce((o, arg, i) => {
  let val = argv[arg];

  if(arg === 'env') {
    val = val.toUpperCase();
    arg = arg.toUpperCase();
  }

  if(arg.length > 1 && !/\$/.test(arg)) {
    o[arg] = val;
  }

  if(i === args.length - 1 && !_.has(argv, 'env')) {
    o.ENV = 'DEV';
  }
  return o;
}, {});

//TODO: set this earlier
if(cliConfig.ENV === 'DEV') {
  process.env.DEV = true;
}

const plugins = pluginFn({
  lazy: false,
  pattern: [
    'gulp-*',
    'gulp.*',
    'run-sequence'
  ],
  rename: {
    'gulp-util': 'gutil',
    'run-sequence': 'sequence'
  }
});
const envConfig = _.merge({}, config, cliConfig);
const tasksDir = join(process.cwd(), 'gulp/tasks');

/**
 * Load all gulp task functions to access on the `tasksMap` Object. Passes
 * the `gulp` object, all plugins with `gulp-` prefix in `package.json` and
 * the entire `config` object from `./gulp/config` for access into gulp task
 * callback functions.
 * @param {String} path to the gulp task callback
 * @return {Function} callback function for use in `gulp.task`
 */
var getTask = (taskPath) => {
  return require(taskPath)(gulp, plugins, envConfig);
};

/**
 * Strips dashes from string and converts the following character to uppercase
 * @param {String} potentially has dashes
 * @return {String} if string contains dashes they are stripped and following character to uppercase
 */
var dashToCamel = (str) => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

/**
 * Creates an object with keys corresponding to the Gulp task name and
 * values corresponding to the callback function passed as the second
 * argument to `gulp.task`
 * @param {Array} all fill and directory names in the `gulp/task` directory
 * @return {Object} map of task names to callback functions to be used in `gulp.task`
 */
var tasksMap = read(tasksDir).reduce( (o, name) => {
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

export default tasksMap;
export var {ENV} = cliConfig;
export {plugins};
