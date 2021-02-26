import path from 'path';
import fs from 'fs';
import { convertFromMetaSchema } from '../src/meta-object/convert';

function generateMetaObjectFixture() {
  const inDir = path.resolve(
    __dirname,
    '../../__fixtures__/api/meta-schema.json'
  );
  const outDir = path.resolve(
    __dirname,
    '../../__fixtures__/api/meta-obj.json'
  );
  fs.readFile(inDir, { encoding: 'utf8' }, (err, data) => {
    if (err) return console.log(err);
    const converted = convertFromMetaSchema(JSON.parse(data));
    fs.writeFile(outDir, JSON.stringify(converted), (err) => {
      if (err) return console.log(err);
      console.log('DONE');
    });
  });
}

generateMetaObjectFixture();
