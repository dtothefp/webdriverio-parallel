export default function(gulp, plugins, config) {
  var {open} = plugins;
  const options = {
    url: 'http://localhost:3000',
    app: 'google chrome'
  };

  return () => {
    return gulp.src('./dist/index.html')
    .pipe(open('', options));
  };
}
