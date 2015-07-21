import {merge} from 'lodash';
import {log} from 'gulp-util';
import {join} from 'path';
import {fork, spawn} from 'child_process';

export default function(isTunnel) {
  let cp = spawn(join(process.cwd(), 'node_modules/webdriverio/bin/wdio'),
    [
      join(__dirname, 'wdio-config'),
      '--harmony'
    ],
    {
      stdio: 'inherit',
      env: merge({}, process.env, {
        WDIO_CLI: true,
        TUNNEL: isTunnel
      })
    });

  return cp;
}
