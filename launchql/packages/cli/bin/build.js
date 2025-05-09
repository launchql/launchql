const fs = require('fs');
const path = require('path');
const glob = require('glob').sync;

const srcDir = path.resolve(`${__dirname}/../src/lib/cmds`);

const paths = glob(`${srcDir}/**.js`).map((file) => {
  const [, name] = file.match(/\/([a-zA-Z]+)\.js/);
  return {
    name,
    path: file.replace(srcDir, './cmds').replace(/\.js$/, '')
  };
});

const imports = paths
  .map((f) => {
    return [`import _${f.name} from '${f.path}';`];
  })
  .join('\n');

const out = `
${imports}

${paths
  .map((a) => {
    return `module.exports['${a.name}'] = _${a.name};`;
  })
  .join('\n')}

  `;

fs.writeFileSync(`${__dirname}/../src/lib/index.js`, out);

// ALIASES

const aliases = paths
  .map((f) => {
    return [`import { aliases as _${f.name} } from '${f.path}';`];
  })
  .join('\n');

const aliasOut = `
  ${aliases}

  ${paths
    .map((a) => {
      return `module.exports['${a.name}'] = _${a.name};`;
    })
    .join('\n')}

  `;

fs.writeFileSync(`${__dirname}/../src/lib/aliases.js`, aliasOut);
