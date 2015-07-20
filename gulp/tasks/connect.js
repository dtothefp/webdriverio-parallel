export default function(gulp, plugins, config) {
  var {connect} = plugins;

  return (cb) => {
    connect.server({
      root: 'dist',
      port: 3000
    });
    connect.serverIsRunning = true;
    connect.killServer = () => {
      if(connect.serverIsRunning) {
        connect.serverIsRunning = false;
        return connect.serverClose();
      }
    };

    cb();
  };
}

