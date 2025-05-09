import { sqitchPath } from '@launchql/db-utils';
import { prompt } from 'inquirerer';
import { basename } from 'path';
const mkdirp = require('mkdirp').sync;
const fs = require('fs');

const questions = [
  {
    name: 'name',
    message: 'test name',
    required: true
  }
];
export default async (argv) => {
  const PKGDIR = await sqitchPath();
  const { name } = await prompt(questions, argv);

  const template = `
import { getConnection, closeConnection } from './utils';

let db;

describe('${name}', () => {
  beforeEach(async () => {
    db = await getConnection();
  });
  afterEach(async () => {
    await closeConnection(db);
  });
  describe('has a database', () => {
    it('it works', async () => {
      const [object] = await db.any(
        \`INSERT INTO objects.object (name) VALUES ($1) RETURNING *\`,
        ['hello world']
      );
      console.log(object);
    });
  });
});`;
  mkdirp(`${PKGDIR}/test/`);
  fs.writeFileSync(`${PKGDIR}/test/${name}.test.js`, template);
};
