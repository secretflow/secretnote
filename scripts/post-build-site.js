// post-build script of *-site playground. Copy built artifacts to corresponding
// static directory for Jupyter to serve.

const path = require('path');
const fs = require('fs');
const argv = require('process').argv;

if (argv.length < 3) {
  console.log('Usage: node post-build.js [site-name]');
  process.exit(1);
}
const siteName = argv[2];

const workDir = path.join(__dirname, '../');
const src = path.join(workDir, `./packages/secretnote-${siteName}-site/dist/`);
const dst = path.join(workDir, `./pyprojects/secretnote/secretnote/${siteName}/www/`);

// remove the old assets if exists
fs.rmSync(dst, {
  recursive: true,
  force: true,
});
// copy the new assets
fs.cpSync(src, dst, {
  recursive: true,
});
// copy the hint page for --_as-compute-node
if (siteName === 'sf') {
  const filename = 'this-is-compute-node.html';
  fs.copyFileSync(
    path.join(__dirname, `./${filename}`),
    path.join(dst, `./${filename}`),
  );
}
