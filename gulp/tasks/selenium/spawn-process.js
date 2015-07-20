import {merge} from 'lodash';
import {log} from 'gulp-util';
import {join} from 'path';
import {fork, spawn} from 'child_process';

export default function(configFile, argv) {
  let processes = [];

  console.log('SPAWN', configFile, argv);
  //let childProcess = fork(join(__dirname, 'runner.js'), [], {
    //cwd: process.cwd(),
    //env: merge({}, process.env, {HELLO: 'hello'}),
    //execArgv: ['--harmony_modules']
  //});
  //processes.push(childProcess);

  //childProcess
  //.on('message', messageHandler)
  //.on('exit', endHandler);

  //childProcess.send({
    //command: 'run',
    //configFile: configFile,
    //argv: argv
  //});
  console.log(configFile, argv);
  argv.push(configFile);

  let childProcess = spawn(
    join(process.cwd(), 'node_modules/webdriverio/bin/wdio'),
    argv,
    {
      stdio: 'inherit',
      env: merge({}, process.env, {BROWSERS: 'firefox'})
    });
}

function messageHandler(m) {
  log(m.event, m);
}

function endHandler(exitCode) {
  /**
   * give reporter enough time to write everything into log file
   */
  setTimeout(() => {
    log('Child Process Finished');
    process.exit(exitCode);
  }, 100);
}
