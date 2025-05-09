const path = require('path');
const fs = require('fs');
const intro = require('introspectron');
const client = require('launchql-client');

function generateIntrospectionFixture() {
  const inDir = path.resolve(
    __dirname,
    '../../../packages/introspectron/__fixtures__/intro-query-dbe.json'
  );
  const outDir = path.resolve(__dirname, './api/introspection.json');
  fs.readFile(inDir, { encoding: 'utf8' }, (err, data) => {
    if (err) return console.log(err);
    const introspection = intro.parseGraphQuery(JSON.parse(data));
    fs.writeFile(
      outDir,
      JSON.stringify(
        { ...introspection.queries, ...introspection.mutations },
        null,
        2
      ),
      (err) => {
        if (err) return console.log(err);
        console.log('DONE');
      }
    );
  });
}

function generateMetaObjectFixture() {
  const inDir = path.resolve(
    __dirname,
    '../../__fixtures__/api/meta-schema.json'
  );
  const outDir = path.resolve(__dirname, './api/meta-obj.json');
  fs.readFile(inDir, { encoding: 'utf8' }, (err, data) => {
    if (err) return console.log(err);
    const converted = client.MetaObject.convertFromMetaSchema(JSON.parse(data));
    fs.writeFile(outDir, JSON.stringify(converted), (err) => {
      if (err) return console.log(err);
      console.log('DONE');
    });
  });
}

generateIntrospectionFixture();
// generateMetaObjectFixture();///////////
