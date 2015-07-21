'use strict';

import gulp from 'gulp';
import tasks, {ENV, plugins as $} from './gulp/config/gulpfile-utils';
var isDev = ENV === 'DEV';

gulp.task('webpack', tasks.webpack);
gulp.task('browser-sync', tasks.browserSync);
gulp.task('selenium', tasks.selenium);
gulp.task('selenium:tunnel', tasks.selenium);
gulp.task('selenium:tunnel:parallel', tasks.selenium);
gulp.task('selenium:parallel', tasks.selenium);
gulp.task('selenium:tunnel:live', tasks.selenium);
gulp.task('lint', tasks.eslint);
gulp.task('connect', tasks.connect);
gulp.task('template', tasks.template);
gulp.task('open', tasks.open);

gulp.task('build', ['lint', 'webpack', 'template']);

gulp.task('default', (cb) => {
  $.sequence(
    'build',
    'browser-sync',
    cb
  );
});

gulp.task('test', (cb) => {
  $.sequence(
    'browser-sync',
    'selenium',
    cb
  );
});
