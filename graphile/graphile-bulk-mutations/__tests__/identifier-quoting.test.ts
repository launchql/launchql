import {
  buildBulkDeleteSQL,
  buildBulkInsertSQL,
  buildBulkUpdateSQL,
} from '../src/utils/sql-builder';

describe('bulk mutation catalog identifier quoting', () => {
  const hostile = 'value" RETURNING secret --';
  const quoted = '"value"" RETURNING secret --"';

  it('escapes insert, conflict, update, and returning identifiers', () => {
    const [query] = buildBulkInsertSQL(
      'tenant_a.items',
      [{ name: hostile, sqlType: 'text' }],
      [{ [hostile]: 'safe-value' }],
      [hostile],
      { conflictColumns: [hostile], action: 'UPDATE', updateColumns: [hostile] }
    );

    expect(query.text).toContain(`(${quoted})`);
    expect(query.text).toContain(`ON CONFLICT (${quoted})`);
    expect(query.text).toContain(`${quoted} = EXCLUDED.${quoted}`);
    expect(query.text).toContain(`RETURNING ${quoted}`);
    expect(query.values).toEqual(['safe-value']);
  });

  it('escapes update and delete identifiers', () => {
    const update = buildBulkUpdateSQL(
      'tenant_a.items',
      { [hostile]: 'safe-value' },
      [{ name: hostile, sqlType: 'text' }],
      [hostile],
      'TRUE',
      []
    );
    const deletion = buildBulkDeleteSQL(
      'tenant_a.items',
      [hostile],
      'TRUE',
      []
    );

    expect(update.text).toContain(`${quoted} = $1::text`);
    expect(update.text).toContain(`RETURNING ${quoted}`);
    expect(deletion.text).toContain(`RETURNING ${quoted}`);
  });
});
