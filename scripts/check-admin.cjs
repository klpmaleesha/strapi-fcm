'use strict';
const { build } = require('esbuild');
build({ entryPoints: ['admin/src/index.js'], bundle: true, write: false, loader: { '.js': 'jsx', '.png': 'dataurl' }, packages: 'external', logLevel: 'warning' })
  .then(() => console.log('Admin source bundle passed.'))
  .catch(() => { process.exitCode = 1; });
