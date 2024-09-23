#!/usr/bin/env node
import { spawn } from 'child_process';
// eslint-disable-next-line node/no-unpublished-import
import { run } from 'mwtsc';
const isWin = process.platform === 'win32';
const cwd = process.cwd();
// eslint-disable-next-line prefer-const
let runMidway;
const watchPackageChild = spawn(
  'lerna',
  [
    'watch',
    '--',
    '"lerna run build --scope=%LERNA_PACKAGE_NAME% && echo package build success"',
  ],
  {
    stdio: ['pipe', 'pipe', 'inherit'],
    cwd: cwd,
    shell: isWin,
  }
);
// watchPackageChild.stdout.pipe(process.stdout);
watchPackageChild.stdout.on('data', data => {
  data = data.toString('utf8');
  console.log(data);
  if (data.trim() === 'package build success') {
    runMidway.restart();
  }
});
runMidway = run();
