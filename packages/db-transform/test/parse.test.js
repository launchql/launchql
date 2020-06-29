import { transform } from '../src/index';
import { cleanTree, cleanLines } from './utils';
const parser = require('pgsql-parser');

describe('transforms', () => {
  it('function', () => {
    const input = `SELECT * FROM original.table`;
    const expectResult = `SELECT * FROM amazing."table";`;

    const result = transform(input, {
      schemaname: function(value) {
        if (value === 'original') {
          return 'amazing';
        }
        return value;
      },
    });

    expect(cleanTree(parser.parse(result))).toEqual(cleanTree(parser.parse(expectResult)));

  });
  it('object', () => {
    const input = `SELECT * FROM original.table`;
    const expectResult = `SELECT * FROM amazing."table";`;
    const result = transform(input, {
      schemaname: {
        original: 'amazing',
      },
    });

    expect(cleanTree(parser.parse(result))).toEqual(cleanTree(parser.parse(expectResult)));

  });
  it('integration', () => {
    const input = `CREATE TABLE users_private.user_account (
        user_id uuid PRIMARY KEY REFERENCES users.user (id) ON DELETE CASCADE,
        email text NOT NULL UNIQUE CHECK (email ~* '^.+@.+\..+$'),
        password_hash text NOT NULL
    );`;
    const expectResult = `CREATE TABLE customers.profile (
     	user_id uuid PRIMARY KEY REFERENCES users.\"user\" ( id ) ON DELETE CASCADE,
    	email text NOT NULL UNIQUE CHECK ( ((email) ~* ('^.+@.+..+$')) ),
    	password_hash text NOT NULL
    );`;

    const result = transform(input,
      {
        schemaname: {
          users_private: 'customers',
        },
        relname: {
          user_account: 'profile',
        },
      }
    );

    expect(cleanTree(parser.parse(result))).toEqual(cleanTree(parser.parse(expectResult)));
  });
});
