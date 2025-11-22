process.env.LOG_SCOPE = 'drizzle-orm-test';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { drizzle } from 'drizzle-orm/node-postgres';
import { pgTable, pgSchema, uuid, text, serial, integer } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import { seed } from 'pgsql-test';
import { getConnections, PgTestClient } from '../src';

let pg: PgTestClient;
let db: PgTestClient;
let teardown: () => Promise<void>;
let testDir: string;

const customSchema = pgSchema('custom');

const usersTable = customSchema.table('users', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull()
});

const petsTable = customSchema.table('pets', {
  id: serial('id').primaryKey(),
  ownerId: uuid('owner_id').notNull(),
  name: text('name').notNull()
});

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
  testDir = join(tmpdir(), `drizzle-orm-test-${Date.now()}`);
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
}, 30000);

afterAll(async () => {
  await teardown();
}, 30000);

beforeEach(async () => {
  await pg.beforeEach();
  await db.beforeEach();
});

afterEach(async () => {
  await pg.afterEach();
  await db.afterEach();
});

describe('loadJson() method with Drizzle', () => {
  it('should load users with pg client and query via Drizzle', async () => {
    await pg.loadJson({
      'custom.users': [users[0], users[1]]
    });

    const drizzleDb = drizzle(pg.client, { schema: { users: usersTable } });
    const result = await drizzleDb.select().from(usersTable).orderBy(usersTable.name);
    
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
  });

  it('should load users with db client and query via Drizzle with RLS', async () => {
    db.setContext({ role: 'authenticated', 'jwt.claims.user_id': users[2].id });
    await db.beforeEach();

    await db.loadJson({
      'custom.users': [users[2]]
    });

    const drizzleDb = drizzle(db.client, { schema: { users: usersTable } });
    const result = await drizzleDb.select().from(usersTable);
    
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Charlie');
  });

  it('should load users and their pets, query via Drizzle', async () => {
    await pg.loadJson({
      'custom.users': [users[0]],
      'custom.pets': [pets[0], pets[1]]
    });

    const drizzleDb = drizzle(pg.client, { 
      schema: { users: usersTable, pets: petsTable } 
    });
    
    const resultUsers = await drizzleDb.select().from(usersTable);
    const resultPets = await drizzleDb.select().from(petsTable).orderBy(petsTable.id);
    
    expect(resultUsers).toHaveLength(1);
    expect(resultUsers[0].name).toBe('Alice');
    expect(resultPets).toHaveLength(2);
    expect(resultPets[0].name).toBe('Fluffy');
    expect(resultPets[0].ownerId).toBe(users[0].id);
    expect(resultPets[1].name).toBe('Spot');
    expect(resultPets[1].ownerId).toBe(users[0].id);
  });

  it('should insert via Drizzle and verify with RLS context', async () => {
    db.setContext({ role: 'authenticated', 'jwt.claims.user_id': users[0].id });
    await db.beforeEach();

    const drizzleDb = drizzle(db.client, { schema: { users: usersTable } });
    
    await drizzleDb.insert(usersTable).values({
      id: users[0].id,
      name: users[0].name
    });

    const result = await drizzleDb.select().from(usersTable);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Alice');
  });
});

describe('loadCsv() method with Drizzle', () => {
  it('should load users from CSV with pg client and query via Drizzle', async () => {
    const csvPath = join(testDir, 'users.csv');
    const csvContent = 'id,name\n' + [users[0], users[1]].map(u => `${u.id},${u.name}`).join('\n') + '\n';
    writeFileSync(csvPath, csvContent);

    await pg.loadCsv({
      'custom.users': csvPath
    });

    const drizzleDb = drizzle(pg.client, { schema: { users: usersTable } });
    const result = await drizzleDb.select().from(usersTable).orderBy(usersTable.name);
    
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
  });

  it('should fail to load users from CSV with db client due to RLS', async () => {
    db.setContext({ role: 'authenticated', 'jwt.claims.user_id': users[2].id });
    await db.beforeEach();

    const csvPath = join(testDir, 'users2.csv');
    const csvContent = 'id,name\n' + `${users[2].id},${users[2].name}\n`;
    writeFileSync(csvPath, csvContent);

    // Use savepoint to handle expected failure without aborting transaction
    const savepointName = 'csv_rls_test';
    await db.savepoint(savepointName);
    
    await expect(
      db.loadCsv({
        'custom.users': csvPath
      })
    ).rejects.toThrow('COPY FROM not supported with row-level security');
    
    // Rollback to savepoint to clear the error state
    await db.rollback(savepointName);
  });

  it('should load users and pets from CSV and query via Drizzle', async () => {
    const usersPath = join(testDir, 'users3.csv');
    const petsPath = join(testDir, 'pets.csv');
    
    writeFileSync(usersPath, `id,name\n${users[0].id},${users[0].name}\n`);
    writeFileSync(petsPath, 'id,owner_id,name\n' + [pets[0], pets[1]].map(p => `${p.id},${p.owner_id},${p.name}`).join('\n') + '\n');

    await pg.loadCsv({
      'custom.users': usersPath,
      'custom.pets': petsPath
    });

    const drizzleDb = drizzle(pg.client, { 
      schema: { users: usersTable, pets: petsTable } 
    });
    
    const resultUsers = await drizzleDb.select().from(usersTable);
    const resultPets = await drizzleDb.select().from(petsTable).orderBy(petsTable.id);
    
    expect(resultUsers).toHaveLength(1);
    expect(resultPets).toHaveLength(2);
    expect(resultPets[0].ownerId).toBe(users[0].id);
    expect(resultPets[1].ownerId).toBe(users[0].id);
  });
});

describe('loadSql() method with Drizzle', () => {
  it('should load users from SQL file with pg client and query via Drizzle', async () => {
    const sqlPath = join(testDir, 'seed.sql');
    const sqlContent = [users[0], users[1]]
      .map(u => `INSERT INTO custom.users (id, name) VALUES ('${u.id}', '${u.name}');`)
      .join('\n');
    writeFileSync(sqlPath, sqlContent);

    await pg.loadSql([sqlPath]);

    const drizzleDb = drizzle(pg.client, { schema: { users: usersTable } });
    const result = await drizzleDb.select().from(usersTable).orderBy(usersTable.name);
    
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
  });

  it('should load users from SQL file with db client and query via Drizzle with RLS', async () => {
    db.setContext({ role: 'authenticated', 'jwt.claims.user_id': users[2].id });
    await db.beforeEach();

    const sqlPath = join(testDir, 'seed2.sql');
    writeFileSync(sqlPath, `INSERT INTO custom.users (id, name) VALUES ('${users[2].id}', '${users[2].name}');`);

    await db.loadSql([sqlPath]);

    const drizzleDb = drizzle(db.client, { schema: { users: usersTable } });
    const result = await drizzleDb.select().from(usersTable);
    
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Charlie');
  });

  it('should load users and pets from multiple SQL files in order and query via Drizzle', async () => {
    const usersPath = join(testDir, 'users.sql');
    const petsPath = join(testDir, 'pets.sql');
    
    writeFileSync(usersPath, `INSERT INTO custom.users (id, name) VALUES ('${users[0].id}', '${users[0].name}');`);
    const petsSql = [pets[0], pets[1]]
      .map(p => `INSERT INTO custom.pets (id, owner_id, name) VALUES (${p.id}, '${p.owner_id}', '${p.name}');`)
      .join('\n');
    writeFileSync(petsPath, petsSql);

    await pg.loadSql([usersPath, petsPath]);

    const drizzleDb = drizzle(pg.client, { 
      schema: { users: usersTable, pets: petsTable } 
    });
    
    const resultUsers = await drizzleDb.select().from(usersTable);
    const resultPets = await drizzleDb.select().from(petsTable).orderBy(petsTable.id);
    
    expect(resultUsers).toHaveLength(1);
    expect(resultPets).toHaveLength(2);
    expect(resultPets[0].ownerId).toBe(users[0].id);
    expect(resultPets[1].ownerId).toBe(users[0].id);
  });
});

describe('cross-connection visibility with publish() and Drizzle', () => {
  afterEach(async () => {
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

  it('should make pg data visible to db after publish, query via Drizzle', async () => {
    await pg.loadJson({
      'custom.users': [users[0]]
    });

    await pg.publish();

    db.setContext({ role: 'authenticated', 'jwt.claims.user_id': users[0].id });
    await db.beforeEach();

    const drizzleDb = drizzle(db.client, { schema: { users: usersTable } });
    const result = await drizzleDb.select().from(usersTable);
    
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Alice');
  });

  it('should make db data visible to pg after publish, query via Drizzle', async () => {
    db.setContext({ role: 'authenticated', 'jwt.claims.user_id': users[1].id });
    await db.beforeEach();

    await db.loadJson({
      'custom.users': [users[1]]
    });

    await db.publish();

    const drizzleDb = drizzle(pg.client, { schema: { users: usersTable } });
    const result = await drizzleDb.select().from(usersTable);
    
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bob');
  });

  it('should support multiple publish cycles with users and pets, query via Drizzle', async () => {
    await pg.loadJson({
      'custom.users': [users[0]],
      'custom.pets': [pets[0]]
    });
    await pg.publish();

    db.setContext({ role: 'authenticated', 'jwt.claims.user_id': users[1].id });
    await db.beforeEach();

    await db.loadJson({
      'custom.users': [users[1]],
      'custom.pets': [pets[2]]
    });
    await db.publish();

    const drizzleDb = drizzle(pg.client, { 
      schema: { users: usersTable, pets: petsTable } 
    });
    
    const resultUsers = await drizzleDb.select().from(usersTable).orderBy(usersTable.name);
    const resultPets = await drizzleDb.select().from(petsTable).orderBy(petsTable.id);
    
    expect(resultUsers).toHaveLength(2);
    expect(resultUsers[0].name).toBe('Alice');
    expect(resultUsers[1].name).toBe('Bob');
    expect(resultPets).toHaveLength(2);
    expect(resultPets[0].ownerId).toBe(users[0].id);
    expect(resultPets[1].ownerId).toBe(users[1].id);
  });
});

describe('Drizzle insert/update/delete with seed data', () => {
  it('should seed with loadJson and then insert via Drizzle', async () => {
    await pg.loadJson({
      'custom.users': [users[0]]
    });

    db.setContext({ role: 'authenticated', 'jwt.claims.user_id': users[1].id });
    await db.beforeEach();

    const drizzleDb = drizzle(db.client, { schema: { users: usersTable } });
    
    await drizzleDb.insert(usersTable).values({
      id: users[1].id,
      name: users[1].name
    });

    const result = await drizzleDb.select().from(usersTable);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bob');
  });

  it('should seed with loadCsv and then update via Drizzle', async () => {
    const csvPath = join(testDir, 'users-update.csv');
    const csvContent = `id,name\n${users[0].id},${users[0].name}\n`;
    writeFileSync(csvPath, csvContent);

    await pg.loadCsv({
      'custom.users': csvPath
    });

    const drizzleDb = drizzle(pg.client, { schema: { users: usersTable } });
    
    await drizzleDb.update(usersTable)
      .set({ name: 'Alice Updated' })
      .where(eq(usersTable.id, users[0].id));

    const result = await drizzleDb.select().from(usersTable);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Alice Updated');
  });

  it('should seed with loadSql and then delete via Drizzle', async () => {
    const sqlPath = join(testDir, 'seed-delete.sql');
    writeFileSync(sqlPath, `INSERT INTO custom.users (id, name) VALUES ('${users[0].id}', '${users[0].name}'), ('${users[1].id}', '${users[1].name}');`);

    await pg.loadSql([sqlPath]);

    const drizzleDb = drizzle(pg.client, { schema: { users: usersTable } });
    
    await drizzleDb.delete(usersTable).where(eq(usersTable.id, users[0].id));

    const result = await drizzleDb.select().from(usersTable);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bob');
  });
});
