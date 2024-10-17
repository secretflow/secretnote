const path = require('path');
const fs = require('fs');

const dst = path.join(__dirname, '../../pyprojects/secretnote/secretnote/scql/');
// remove the old assets if exists
fs.rmSync(path.join(dst, 'www/'), {
  recursive: true,
  force: true,
});
// copy the new assets
fs.cpSync('./dist/', path.join(dst, 'www/'), {
  recursive: true,
});
