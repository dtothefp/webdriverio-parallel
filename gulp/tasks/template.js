export default function(gulp, plugins, config) {
  var {ENV, isTest} = config;
  var {data, swig} = plugins;
  var isDev = ENV === 'DEV';
  var dest = isDev ? './dist' : './';

  return () => {
    return gulp.src('./src/**/*.html')
      .pipe(data({
        isDev
      }))
      .pipe(swig())
      .pipe(gulp.dest(dest));
  };
}

