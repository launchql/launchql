const fs = require('fs');
const path = require('path');
const glob = require('glob').sync;

const schemaDir = path.resolve(`${__dirname}/../src/schemas`);

const paths = glob(`${schemaDir}/**.js`).map(file => {
  const [, name] = file.match(/\/([a-zA-Z]+)\.js/);
  return {
    name,
    path: file.replace(schemaDir, './schemas').replace(/\.js$/, ''),
  };
});

const imports = paths
  .map(f => {
    return [`import * as ${f.name} from '${f.path}';`];
  })
  .join('\n');

const out = `
${imports}
export default {
  ${paths.map(a => a.name).join(',')}
};`;

fs.writeFileSync(`${__dirname}/../src/index.js`, out);
