import { getConnections, PgTestClient } from 'pgsql-test';
import { snapshot } from 'graphile-test';

let pg: PgTestClient;
let teardown: () => Promise<void>;

const user_id = 'dc474833-318a-41f5-9239-ee563ab657a6';
const user_id_2 = '550e8400-e29b-41d4-a716-446655440000';

describe('encrypted secrets table', () => {
  beforeAll(async () => {
    ({ pg, teardown } = await getConnections());
  });

  afterAll(async () => {
    await teardown();
  });

  beforeEach(async () => {
    await pg.beforeEach();
  });

  afterEach(async () => {
    await pg.afterEach();
  });

  it('should have secrets_schema created', async () => {
    const schemas = await pg.any(
      `SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'secrets_schema'`
    );
    expect(schemas).toHaveLength(1);
    expect(schemas[0].schema_name).toBe('secrets_schema');
  });

  it('should have secrets_table with correct structure', async () => {
    const columns = await pg.any(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns 
       WHERE table_schema = 'secrets_schema' AND table_name = 'secrets_table'
       ORDER BY ordinal_position`
    );
    
    expect(snapshot({ columns })).toMatchSnapshot();
  });

  it('should have unique constraint on (secrets_owned_field, name)', async () => {
    const constraints = await pg.any(
      `SELECT constraint_name, constraint_type
       FROM information_schema.table_constraints
       WHERE table_schema = 'secrets_schema' 
       AND table_name = 'secrets_table'
       AND constraint_type = 'UNIQUE'`
    );
    
    expect(constraints).toHaveLength(1);
  });

  it('should insert record with default values', async () => {
    const [result] = await pg.any(
      `INSERT INTO secrets_schema.secrets_table 
       (secrets_owned_field, name, secrets_value_field, secrets_enc_field)
       VALUES ($1::uuid, 'test-secret', 'test-value'::bytea, 'none')
       RETURNING *`,
      [user_id]
    );

    expect(result.secrets_owned_field).toBe(user_id);
    expect(result.name).toBe('test-secret');
    expect(result.secrets_enc_field).toBe('none');
    expect(result.id).toBeDefined();
  });

  it('should enforce unique constraint on (secrets_owned_field, name)', async () => {
    // Insert first record
    await pg.any(
      `INSERT INTO secrets_schema.secrets_table 
       (secrets_owned_field, name, secrets_value_field, secrets_enc_field)
       VALUES ($1::uuid, 'duplicate-name', 'value1'::bytea, 'none')`,
      [user_id]
    );

    // Try to insert duplicate - should fail
    await expect(
      pg.any(
        `INSERT INTO secrets_schema.secrets_table 
         (secrets_owned_field, name, secrets_value_field, secrets_enc_field)
         VALUES ($1::uuid, 'duplicate-name', 'value2'::bytea, 'none')`,
        [user_id]
      )
    ).rejects.toThrow();
  });

  it('should allow same name for different users', async () => {
    // Insert for first user
    await pg.any(
      `INSERT INTO secrets_schema.secrets_table 
       (secrets_owned_field, name, secrets_value_field, secrets_enc_field)
       VALUES ($1::uuid, 'same-name', 'value1'::bytea, 'none')`,
      [user_id]
    );

    // Insert for second user - should succeed
    const [result] = await pg.any(
      `INSERT INTO secrets_schema.secrets_table 
       (secrets_owned_field, name, secrets_value_field, secrets_enc_field)
       VALUES ($1::uuid, 'same-name', 'value2'::bytea, 'none')
       RETURNING *`,
      [user_id_2]
    );

    expect(result.secrets_owned_field).toBe(user_id_2);
    expect(result.name).toBe('same-name');
  });

  it('should trigger hash_secrets on insert with crypt', async () => {
    const plaintext = 'my-secret-password';
    
    const [result] = await pg.any(
      `INSERT INTO secrets_schema.secrets_table 
       (secrets_owned_field, name, secrets_value_field, secrets_enc_field)
       VALUES ($1::uuid, 'crypt-secret', $2::bytea, 'crypt')
       RETURNING *`,
      [user_id, plaintext]
    );

    // The trigger should have hashed the value
    expect(result.secrets_enc_field).toBe('crypt');
    expect(result.secrets_value_field).not.toEqual(Buffer.from(plaintext));
    
    // Verify it's a bcrypt hash (starts with $2)
    const hashedValue = result.secrets_value_field.toString();
    expect(hashedValue).toMatch(/^\$2[aby]?\$/);
  });

  it('should trigger hash_secrets on insert with pgp', async () => {
    const plaintext = 'my-secret-data';
    
    const [result] = await pg.any(
      `INSERT INTO secrets_schema.secrets_table 
       (secrets_owned_field, name, secrets_value_field, secrets_enc_field)
       VALUES ($1::uuid, 'pgp-secret', $2::bytea, 'pgp')
       RETURNING *`,
      [user_id, plaintext]
    );

    // The trigger should have encrypted the value
    expect(result.secrets_enc_field).toBe('pgp');
    expect(result.secrets_value_field).not.toEqual(Buffer.from(plaintext));
    
    // Should be longer than original due to encryption
    expect(result.secrets_value_field.length).toBeGreaterThan(plaintext.length);
  });

  it('should default to none encryption when not specified', async () => {
    const plaintext = 'unencrypted-data';
    
    const [result] = await pg.any(
      `INSERT INTO secrets_schema.secrets_table 
       (secrets_owned_field, name, secrets_value_field)
       VALUES ($1::uuid, 'none-secret', $2::bytea)
       RETURNING *`,
      [user_id, plaintext]
    );

    // The trigger should set enc_field to 'none'
    expect(result.secrets_enc_field).toBe('none');
    expect(result.secrets_value_field).toEqual(Buffer.from(plaintext));
  });

  it('should trigger hash_secrets on update when value changes', async () => {
    // Insert initial record
    const [initial] = await pg.any(
      `INSERT INTO secrets_schema.secrets_table 
       (secrets_owned_field, name, secrets_value_field, secrets_enc_field)
       VALUES ($1::uuid, 'update-test', 'initial-value'::bytea, 'none')
       RETURNING *`,
      [user_id]
    );

    // Update to use crypt encryption
    const [updated] = await pg.any(
      `UPDATE secrets_schema.secrets_table 
       SET secrets_value_field = 'new-password'::bytea, secrets_enc_field = 'crypt'
       WHERE id = $1
       RETURNING *`,
      [initial.id]
    );

    // Should be encrypted now
    expect(updated.secrets_enc_field).toBe('crypt');
    expect(updated.secrets_value_field).not.toEqual(Buffer.from('new-password'));
    
    // Verify it's a bcrypt hash
    const hashedValue = updated.secrets_value_field.toString();
    expect(hashedValue).toMatch(/^\$2[aby]?\$/);
  });

  it('should not trigger hash_secrets on update when value unchanged', async () => {
    // Insert initial record with crypt
    const [initial] = await pg.any(
      `INSERT INTO secrets_schema.secrets_table 
       (secrets_owned_field, name, secrets_value_field, secrets_enc_field)
       VALUES ($1::uuid, 'no-update-test', 'password'::bytea, 'crypt')
       RETURNING *`,
      [user_id]
    );

    const originalHash = initial.secrets_value_field;

    // Update name only (not the value field)
    const [updated] = await pg.any(
      `UPDATE secrets_schema.secrets_table 
       SET name = 'renamed-secret'
       WHERE id = $1
       RETURNING *`,
      [initial.id]
    );

    // Hash should remain the same
    expect(updated.secrets_value_field).toEqual(originalHash);
    expect(updated.name).toBe('renamed-secret');
  });

  it('should verify crypt hash works correctly', async () => {
    const password = 'test-password-123';
    
    // Insert with crypt
    const [result] = await pg.any(
      `INSERT INTO secrets_schema.secrets_table 
       (secrets_owned_field, name, secrets_value_field, secrets_enc_field)
       VALUES ($1::uuid, 'crypt-verify', $2::bytea, 'crypt')
       RETURNING *`,
      [user_id, password]
    );

    // The stored hash should be different from the original password
    const storedHash = result.secrets_value_field.toString();
    expect(storedHash).not.toBe(password);
    
    // Verify it's a proper bcrypt hash format
    expect(storedHash).toMatch(/^\$2[aby]?\$/);
    
    // Verify the hash is the expected length (bcrypt hashes are typically 60 characters)
    expect(storedHash.length).toBe(60);
    
    // Verify that inserting the same password again produces a different hash (salt should be different)
    const [result2] = await pg.any(
      `INSERT INTO secrets_schema.secrets_table 
       (secrets_owned_field, name, secrets_value_field, secrets_enc_field)
       VALUES ($1::uuid, 'crypt-verify-2', $2::bytea, 'crypt')
       RETURNING *`,
      [user_id, password]
    );
    
    const storedHash2 = result2.secrets_value_field.toString();
    expect(storedHash2).not.toBe(storedHash); // Different salt = different hash
    expect(storedHash2).toMatch(/^\$2[aby]?\$/);
  });

  it('should handle null values correctly', async () => {
    const [result] = await pg.any(
      `INSERT INTO secrets_schema.secrets_table 
       (secrets_owned_field, name, secrets_value_field, secrets_enc_field)
       VALUES ($1::uuid, 'null-test', NULL, NULL)
       RETURNING *`,
      [user_id]
    );

    // Trigger should set enc_field to 'none' even when value is null
    expect(result.secrets_enc_field).toBe('none');
    expect(result.secrets_value_field).toBeNull();
  });
}); 