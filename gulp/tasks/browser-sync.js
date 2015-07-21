export default function(gulp, plugins, config) {
  var {browserSync} = plugins;

  return (cb) => {
    browserSync({
      server: './dist',
      port: 3000,
    }, cb);
  };
}

