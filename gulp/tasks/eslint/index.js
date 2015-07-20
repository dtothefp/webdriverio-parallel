import {join} from 'path';
import eslintConfig from './eslint-config';
import formatter from 'eslint-friendly-formatter';

export default function(gulp, plugins, config) {
  var {eslint} = plugins;
  var {buildSrc, testSrc, ENV} = config;
  let rules = eslintConfig({
    ENV
  });
  let configFile = join(__dirname, 'es6-config.json');
  let pluginConfig = {
    rules,
    configFile,
    useEslintrc: false
  };

  return () => {
    return gulp.src([
      `${testSrc}/**/*.js`,
      `${buildSrc}/**/*.js`,
      '!' + join(process.cwd(), 'src/lib/**/*.js'),
      '!' + join(process.cwd(), 'node_modules/**/*.js')
    ])
    .pipe(eslint(pluginConfig))
    .pipe(eslint.format(formatter))
    .pipe(eslint.failOnError());
  };
}

