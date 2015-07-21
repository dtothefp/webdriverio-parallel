export default function(gulp, plugins, config) {
  var {browserSync} = plugins;
  var {ENV} = config;
  var isDev = ENV === 'DEV';
  var dest = isDev ? './dist' : './';

  return (cb) => {
    browserSync({
      server: dest,
      port: 3000,
    }, cb);
  };
}

