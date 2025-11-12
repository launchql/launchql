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

// Test data
const users = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Alice' },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Bob' },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Charlie' }
];

const pets = [
  { id: 1, owner_id: users[0].id, name: 'Fluffy' },
  { id: 2, owner_id: users[0].id, name: 'Spot' },
  { id: 3, owner_id: users[1].id, name: 'Rex' }
];

beforeAll(async () => {
  testDir = join(tmpdir(), `pgsql-test-${Date.now()}`);
  mkdirSync(testDir, { recursive: true });

  ({ pg, db, teardown } = await getConnections({}, [
    seed.fn(async ({ pg }) => {
      await pg.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        CREATE SCHEMA custom;
        
        CREATE TABLE custom.users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL
        );

        CREATE TABLE custom.pets (
          id SERIAL PRIMARY KEY,
          owner_id UUID NOT NULL REFERENCES custom.users(id),
          name TEXT NOT NULL
        );

        ALTER TABLE custom.users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE custom.pets ENABLE ROW LEVEL SECURITY;

        CREATE POLICY users_select ON custom.users
          FOR SELECT
          USING (id = current_setting('jwt.claims.user_id', true)::UUID);

        CREATE POLICY users_insert ON custom.users
          FOR INSERT
          WITH CHECK (id = current_setting('jwt.claims.user_id', true)::UUID);

        CREATE POLICY pets_select ON custom.pets
          FOR SELECT
          USING (owner_id = current_setting('jwt.claims.user_id', true)::UUID);

        CREATE POLICY pets_insert ON custom.pets
          FOR INSERT
          WITH CHECK (owner_id = current_setting('jwt.claims.user_id', true)::UUID);

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
      'custom.users': [users[0], users[1]]
    });

    const result = await pg.any('SELECT * FROM custom.users ORDER BY name');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
  });

  it('should load users with db client', async () => {
    db.setContext({ 'jwt.claims.user_id': users[2].id });
    await db.beforeEach();

    await db.loadJson({
      'custom.users': [users[2]]
    });

    const result = await db.any('SELECT * FROM custom.users');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Charlie');
  });

  it('should load users and their pets', async () => {
    await pg.loadJson({
      'custom.users': [users[0]],
      'custom.pets': [pets[0], pets[1]]
    });

    const resultUsers = await pg.any('SELECT * FROM custom.users');
    const resultPets = await pg.any('SELECT * FROM custom.pets ORDER BY id');
    
    expect(resultUsers).toHaveLength(1);
    expect(resultUsers[0].name).toBe('Alice');
    expect(resultPets).toHaveLength(2);
    expect(resultPets[0].name).toBe('Fluffy');
    expect(resultPets[0].owner_id).toBe(users[0].id);
    expect(resultPets[1].name).toBe('Spot');
    expect(resultPets[1].owner_id).toBe(users[0].id);
  });
});

describe('loadCsv() method', () => {
  it('should load users from CSV with pg client', async () => {
    const csvPath = join(testDir, 'users.csv');
    const csvContent = 'id,name\n' + [users[0], users[1]].map(u => `${u.id},${u.name}`).join('\n') + '\n';
    writeFileSync(csvPath, csvContent);

    await pg.loadCsv({
      'custom.users': csvPath
    });

    const result = await pg.any('SELECT * FROM custom.users ORDER BY name');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
  });

  it('should fail to load users from CSV with db client due to RLS', async () => {
    db.setContext({ 'jwt.claims.user_id': users[2].id });
    await db.beforeEach();

    const csvPath = join(testDir, 'users2.csv');
    const csvContent = 'id,name\n' + `${users[2].id},${users[2].name}\n`;
    writeFileSync(csvPath, csvContent);

    // COPY FROM is not supported with row-level security
    await expect(
      db.loadCsv({
        'custom.users': csvPath
      })
    ).rejects.toThrow('COPY FROM not supported with row-level security');
  });

  it('should load users and pets from CSV', async () => {
    const usersPath = join(testDir, 'users3.csv');
    const petsPath = join(testDir, 'pets.csv');
    
    writeFileSync(usersPath, `id,name\n${users[0].id},${users[0].name}\n`);
    writeFileSync(petsPath, 'id,owner_id,name\n' + [pets[0], pets[1]].map(p => `${p.id},${p.owner_id},${p.name}`).join('\n') + '\n');

    await pg.loadCsv({
      'custom.users': usersPath,
      'custom.pets': petsPath
    });

    const resultUsers = await pg.any('SELECT * FROM custom.users');
    const resultPets = await pg.any('SELECT * FROM custom.pets ORDER BY id');
    
    expect(resultUsers).toHaveLength(1);
    expect(resultPets).toHaveLength(2);
    expect(resultPets[0].owner_id).toBe(users[0].id);
    expect(resultPets[1].owner_id).toBe(users[0].id);
  });
});

describe('loadSql() method', () => {
  it('should load users from SQL file with pg client', async () => {
    const sqlPath = join(testDir, 'seed.sql');
    const sqlContent = [users[0], users[1]]
      .map(u => `INSERT INTO custom.users (id, name) VALUES ('${u.id}', '${u.name}');`)
      .join('\n');
    writeFileSync(sqlPath, sqlContent);

    await pg.loadSql([sqlPath]);

    const result = await pg.any('SELECT * FROM custom.users ORDER BY name');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
  });

  it('should load users from SQL file with db client', async () => {
    db.setContext({ 'jwt.claims.user_id': users[2].id });
    await db.beforeEach();

    const sqlPath = join(testDir, 'seed2.sql');
    writeFileSync(sqlPath, `INSERT INTO custom.users (id, name) VALUES ('${users[2].id}', '${users[2].name}');`);

    await db.loadSql([sqlPath]);

    const result = await db.any('SELECT * FROM custom.users');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Charlie');
  });

  it('should load users and pets from multiple SQL files in order', async () => {
    const usersPath = join(testDir, 'users.sql');
    const petsPath = join(testDir, 'pets.sql');
    
    writeFileSync(usersPath, `INSERT INTO custom.users (id, name) VALUES ('${users[0].id}', '${users[0].name}');`);
    const petsSql = [pets[0], pets[1]]
      .map(p => `INSERT INTO custom.pets (id, owner_id, name) VALUES (${p.id}, '${p.owner_id}', '${p.name}');`)
      .join('\n');
    writeFileSync(petsPath, petsSql);

    await pg.loadSql([usersPath, petsPath]);

    const resultUsers = await pg.any('SELECT * FROM custom.users');
    const resultPets = await pg.any('SELECT * FROM custom.pets ORDER BY id');
    
    expect(resultUsers).toHaveLength(1);
    expect(resultPets).toHaveLength(2);
    expect(resultPets[0].owner_id).toBe(users[0].id);
    expect(resultPets[1].owner_id).toBe(users[0].id);
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
      'custom.users': [users[0]]
    });

    await pg.publish();

    // db client needs context to see the user due to RLS
    db.setContext({ 'jwt.claims.user_id': users[0].id });
    await db.beforeEach();

    const result = await db.any('SELECT * FROM custom.users');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Alice');
  });

  it('should make db data visible to pg after publish', async () => {
    db.setContext({ 'jwt.claims.user_id': users[1].id });
    await db.beforeEach();

    await db.loadJson({
      'custom.users': [users[1]]
    });

    await db.publish();

    // pg client (superuser) can see all data
    const result = await pg.any('SELECT * FROM custom.users');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bob');
  });

  it('should support multiple publish cycles with users and pets', async () => {
    // User 1 and their pets from pg connection
    await pg.loadJson({
      'custom.users': [users[0]],
      'custom.pets': [pets[0]]
    });
    await pg.publish();

    // User 2 and their pets from db connection
    db.setContext({ 'jwt.claims.user_id': users[1].id });
    await db.beforeEach();

    await db.loadJson({
      'custom.users': [users[1]],
      'custom.pets': [pets[2]]
    });
    await db.publish();

    // pg client (superuser) can see all data
    const resultUsers = await pg.any('SELECT * FROM custom.users ORDER BY name');
    const resultPets = await pg.any('SELECT * FROM custom.pets ORDER BY id');
    
    expect(resultUsers).toHaveLength(2);
    expect(resultUsers[0].name).toBe('Alice');
    expect(resultUsers[1].name).toBe('Bob');
    expect(resultPets).toHaveLength(2);
    expect(resultPets[0].owner_id).toBe(users[0].id);
    expect(resultPets[1].owner_id).toBe(users[1].id);
  });
});
