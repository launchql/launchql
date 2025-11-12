process.env.LOG_SCOPE = 'pgsql-test';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { seed } from '../src';
import { getConnections } from '../src/connect';
import { PgTestClient } from '../src/test-client';

let pg: PgTestClient;
let db: PgTestClient;
let teardown: () => Promise<void>;
let testDir: string;

beforeAll(async () => {
  testDir = join(tmpdir(), `pgsql-test-${Date.now()}`);
  mkdirSync(testDir, { recursive: true });

  ({ pg, db, teardown } = await getConnections({}, [
    seed.fn(async ({ pg }) => {
      await pg.query(`
        CREATE SCHEMA custom;
        
        CREATE TABLE custom.users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL
        );

        CREATE TABLE custom.pets (
          id SERIAL PRIMARY KEY,
          owner_id INT NOT NULL REFERENCES custom.users(id),
          name TEXT NOT NULL
        );

        GRANT USAGE ON SCHEMA custom TO anonymous, authenticated, administrator;
        GRANT ALL ON ALL TABLES IN SCHEMA custom TO anonymous, authenticated, administrator;
        GRANT ALL ON ALL SEQUENCES IN SCHEMA custom TO anonymous, authenticated, administrator;
      `);
    })
  ]));
});

afterAll(async () => {
  await teardown();
});

beforeEach(async () => {
  await pg.beforeEach();
  await db.beforeEach();
});

afterEach(async () => {
  await pg.afterEach();
  await db.afterEach();
});

describe('loadJson() method', () => {
  it('should load users with pg client', async () => {
    await pg.loadJson({
      'custom.users': [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ]
    });

    const result = await pg.any('SELECT * FROM custom.users ORDER BY id');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
  });

  it('should load users with db client', async () => {
    await db.loadJson({
      'custom.users': [
        { id: 3, name: 'Charlie' }
      ]
    });

    const result = await db.any('SELECT * FROM custom.users ORDER BY id');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Charlie');
  });

  it('should load users and their pets', async () => {
    await pg.loadJson({
      'custom.users': [
        { id: 1, name: 'Alice' }
      ],
      'custom.pets': [
        { id: 1, owner_id: 1, name: 'Fluffy' },
        { id: 2, owner_id: 1, name: 'Spot' }
      ]
    });

    const users = await pg.any('SELECT * FROM custom.users');
    const pets = await pg.any('SELECT * FROM custom.pets ORDER BY id');
    
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe('Alice');
    expect(pets).toHaveLength(2);
    expect(pets[0].name).toBe('Fluffy');
    expect(pets[0].owner_id).toBe(1);
    expect(pets[1].name).toBe('Spot');
    expect(pets[1].owner_id).toBe(1);
  });
});

describe('loadCsv() method', () => {
  it('should load users from CSV with pg client', async () => {
    const csvPath = join(testDir, 'users.csv');
    writeFileSync(csvPath, 'id,name\n1,Alice\n2,Bob\n');

    await pg.loadCsv({
      'custom.users': csvPath
    });

    const result = await pg.any('SELECT * FROM custom.users ORDER BY id');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
  });

  it('should load users from CSV with db client', async () => {
    const csvPath = join(testDir, 'users2.csv');
    writeFileSync(csvPath, 'id,name\n3,Charlie\n');

    await db.loadCsv({
      'custom.users': csvPath
    });

    const result = await db.any('SELECT * FROM custom.users ORDER BY id');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Charlie');
  });

  it('should load users and pets from CSV', async () => {
    const usersPath = join(testDir, 'users3.csv');
    const petsPath = join(testDir, 'pets.csv');
    
    writeFileSync(usersPath, 'id,name\n1,Alice\n');
    writeFileSync(petsPath, 'id,owner_id,name\n1,1,Fluffy\n2,1,Spot\n');

    await pg.loadCsv({
      'custom.users': usersPath,
      'custom.pets': petsPath
    });

    const users = await pg.any('SELECT * FROM custom.users');
    const pets = await pg.any('SELECT * FROM custom.pets ORDER BY id');
    
    expect(users).toHaveLength(1);
    expect(pets).toHaveLength(2);
    expect(pets[0].owner_id).toBe(1);
    expect(pets[1].owner_id).toBe(1);
  });
});

describe('loadSql() method', () => {
  it('should load users from SQL file with pg client', async () => {
    const sqlPath = join(testDir, 'seed.sql');
    writeFileSync(sqlPath, `
      INSERT INTO custom.users (id, name) VALUES (1, 'Alice');
      INSERT INTO custom.users (id, name) VALUES (2, 'Bob');
    `);

    await pg.loadSql([sqlPath]);

    const result = await pg.any('SELECT * FROM custom.users ORDER BY id');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
  });

  it('should load users from SQL file with db client', async () => {
    const sqlPath = join(testDir, 'seed2.sql');
    writeFileSync(sqlPath, `
      INSERT INTO custom.users (id, name) VALUES (3, 'Charlie');
    `);

    await db.loadSql([sqlPath]);

    const result = await db.any('SELECT * FROM custom.users ORDER BY id');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Charlie');
  });

  it('should load users and pets from multiple SQL files in order', async () => {
    const usersPath = join(testDir, 'users.sql');
    const petsPath = join(testDir, 'pets.sql');
    
    writeFileSync(usersPath, `INSERT INTO custom.users (id, name) VALUES (1, 'Alice');`);
    writeFileSync(petsPath, `
      INSERT INTO custom.pets (id, owner_id, name) VALUES (1, 1, 'Fluffy');
      INSERT INTO custom.pets (id, owner_id, name) VALUES (2, 1, 'Spot');
    `);

    await pg.loadSql([usersPath, petsPath]);

    const users = await pg.any('SELECT * FROM custom.users');
    const pets = await pg.any('SELECT * FROM custom.pets ORDER BY id');
    
    expect(users).toHaveLength(1);
    expect(pets).toHaveLength(2);
    expect(pets[0].owner_id).toBe(1);
    expect(pets[1].owner_id).toBe(1);
  });
});

describe('cross-connection visibility with publish()', () => {
  afterEach(async () => {
    // Clean up published data that won't be rolled back
    await pg.query('DELETE FROM custom.pets');
    await pg.query('DELETE FROM custom.users');
    await pg.commit();
    await pg.begin();
    await pg.savepoint();
    
    await db.query('DELETE FROM custom.pets');
    await db.query('DELETE FROM custom.users');
    await db.commit();
    await db.begin();
    await db.savepoint();
  });

  it('should make pg data visible to db after publish', async () => {
    await pg.loadJson({
      'custom.users': [
        { id: 1, name: 'Alice' }
      ]
    });

    await pg.publish();

    const result = await db.any('SELECT * FROM custom.users ORDER BY id');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Alice');
  });

  it('should make db data visible to pg after publish', async () => {
    await db.loadJson({
      'custom.users': [
        { id: 2, name: 'Bob' }
      ]
    });

    await db.publish();

    const result = await pg.any('SELECT * FROM custom.users ORDER BY id');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bob');
  });

  it('should support multiple publish cycles with users and pets', async () => {
    // User 1 and their pets from pg connection
    await pg.loadJson({
      'custom.users': [
        { id: 1, name: 'Alice' }
      ],
      'custom.pets': [
        { id: 1, owner_id: 1, name: 'Fluffy' }
      ]
    });
    await pg.publish();

    // User 2 and their pets from db connection
    await db.loadJson({
      'custom.users': [
        { id: 2, name: 'Bob' }
      ],
      'custom.pets': [
        { id: 2, owner_id: 2, name: 'Spot' }
      ]
    });
    await db.publish();

    const users = await pg.any('SELECT * FROM custom.users ORDER BY id');
    const pets = await pg.any('SELECT * FROM custom.pets ORDER BY id');
    
    expect(users).toHaveLength(2);
    expect(users[0].name).toBe('Alice');
    expect(users[1].name).toBe('Bob');
    expect(pets).toHaveLength(2);
    expect(pets[0].owner_id).toBe(1);
    expect(pets[1].owner_id).toBe(2);
  });
});
