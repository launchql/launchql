import { getConnections, PgTestClient } from 'pgsql-test';

let pg: PgTestClient;
let teardown: () => Promise<void>;

const user_id = 'dc474833-318a-41f5-9239-ee563ab657a6';

describe('encrypted secrets', () => {
  beforeAll(async () => {
    ({ pg, teardown } = await getConnections());
  });

  afterAll(async () => {
    await teardown();
  });

  beforeEach(async () => {
    await pg.beforeEach();
    
    // Insert test data
    await pg.any(`
      INSERT INTO secrets_schema.secrets_table
      ( secrets_owned_field,
        name,
        secrets_value_field,
        secrets_enc_field
      ) VALUES
      (
        $1::uuid,
        'my-secret-name',
        'my-secret'::bytea,
        'pgp'
      )
    `, [user_id]);
  });

  afterEach(async () => {
    await pg.afterEach();
  });

  it('encrypt_field_pgp_get', async () => {
    const [{ encrypt_field_pgp_get }] = await pg.any(
      `SELECT encrypted_secrets.encrypt_field_pgp_get(secrets_value_field, secrets_owned_field::text) 
       FROM secrets_schema.secrets_table 
       WHERE secrets_owned_field = $1`,
      [user_id]
    );
    expect(encrypt_field_pgp_get).toMatchSnapshot();
  });

  it('encrypt_field_set', async () => {
    const [{ encrypt_field_set }] = await pg.any(
      `SELECT encrypted_secrets.encrypt_field_set('myvalue')`
    );
    expect(encrypt_field_set).toMatchSnapshot();
  });

  it('encrypt_field_bytea_to_text', async () => {
    const [{ encrypt_field_bytea_to_text }] = await pg.any(
      `SELECT encrypted_secrets.encrypt_field_bytea_to_text(
        encrypted_secrets.encrypt_field_set('value-there-and-back')
      )`
    );
    expect(encrypt_field_bytea_to_text).toMatchSnapshot();
  });

  it('secrets_getter', async () => {
    const [{ secrets_getter }] = await pg.any(
      `SELECT encrypted_secrets.secrets_getter(
        $1::uuid,
        'my-secret-name'
      )`,
      [user_id]
    );
    expect(secrets_getter).toMatchSnapshot();
  });

  it('secrets_verify', async () => {
    const [{ secrets_verify }] = await pg.any(
      `SELECT encrypted_secrets.secrets_verify(
        $1::uuid,
        'my-secret-name',
        'my-secret'
      )`,
      [user_id]
    );
    expect(secrets_verify).toMatchSnapshot();
  });

  it('secrets_upsert', async () => {
    const [{ secrets_upsert }] = await pg.any(
      `SELECT encrypted_secrets.secrets_upsert(
        $1::uuid,
        'my-secret-name',
        'my-secret-other-value'
      )`,
      [user_id]
    );
    expect(secrets_upsert).toMatchSnapshot();
    
    const [{ secrets_verify }] = await pg.any(
      `SELECT encrypted_secrets.secrets_verify(
        $1::uuid,
        'my-secret-name',
        'my-secret-other-value'
      )`,
      [user_id]
    );
    expect(secrets_verify).toMatchSnapshot();
  });

  it('secrets_delete single', async () => {
    // First verify the secret exists
    const [beforeDelete] = await pg.any(
      `SELECT encrypted_secrets.secrets_getter($1::uuid, 'my-secret-name')`,
      [user_id]
    );
    expect(beforeDelete.secrets_getter).toBe('my-secret');

    // Delete the secret
    await pg.any(
      `SELECT encrypted_secrets.secrets_delete($1::uuid, 'my-secret-name')`,
      [user_id]
    );

    // Verify it's gone
    const [afterDelete] = await pg.any(
      `SELECT encrypted_secrets.secrets_getter($1::uuid, 'my-secret-name', 'default-value')`,
      [user_id]
    );
    expect(afterDelete.secrets_getter).toBe('default-value');
  });

  it('secrets_delete multiple', async () => {
    // Add multiple secrets
    await pg.any(
      `SELECT encrypted_secrets.secrets_upsert($1::uuid, 'secret-1', 'value-1')`,
      [user_id]
    );
    await pg.any(
      `SELECT encrypted_secrets.secrets_upsert($1::uuid, 'secret-2', 'value-2')`,
      [user_id]
    );

    // Delete multiple secrets
    await pg.any(
      `SELECT encrypted_secrets.secrets_delete($1::uuid, $2::text[])`,
      [user_id, ['secret-1', 'secret-2']]
    );

    // Verify they're gone
    const [result1] = await pg.any(
      `SELECT encrypted_secrets.secrets_getter($1::uuid, 'secret-1', 'not-found')`,
      [user_id]
    );
    const [result2] = await pg.any(
      `SELECT encrypted_secrets.secrets_getter($1::uuid, 'secret-2', 'not-found')`,
      [user_id]
    );
    
    expect(result1.secrets_getter).toBe('not-found');
    expect(result2.secrets_getter).toBe('not-found');
  });

  xit('encrypt_field_pgp_getter', async () => {
    const [{ encrypt_field_pgp_getter }] = await pg.any(
      `SELECT encrypted_secrets.encrypt_field_pgp_getter(
        $1::uuid,
        'secrets_value_field',
        'secrets_enc_field'
      )`,
      [user_id]
    );
    expect(encrypt_field_pgp_getter).toMatchSnapshot();
  });

  xit('secrets_table_upsert', async () => {
    const [{ secrets_table_upsert }] = await pg.any(
      `SELECT encrypted_secrets.secrets_table_upsert(
        $1::uuid,
        $2::json
      )`,
      [
        user_id,
        JSON.stringify({
          myOther: 'secret',
          hiOther: 'here'
        })
      ]
    );
    expect(secrets_table_upsert).toMatchSnapshot();
  });
});
