import { QueryBuilder } from '../src/query-builder';

describe('QueryBuilder', () => {
  it('should build a SELECT query', () => {
    const builder = new QueryBuilder();
    const query = builder
      .table('users')
      .select(['id', 'name', 'email'])
      .where('age', '>', 18)
      .limit(10)
      .build();

    expect(query).toBe(
      'SELECT id, name, email FROM users WHERE age > \'18\' LIMIT 10;'
    );
  });

  it('should build an INSERT query', () => {
    const builder = new QueryBuilder();
    const query = builder
      .table('users')
      .insert({ name: 'John', email: 'john@example.com', age: 30 })
      .build();

    expect(query).toBe(
      "INSERT INTO users (name, email, age) VALUES ('John', 'john@example.com', '30');"
    );
  });

  it('should build an UPDATE query', () => {
    const builder = new QueryBuilder();
    const query = builder
      .table('users')
      .update({ name: 'John Doe' })
      .where('id', '=', 1)
      .build();

    expect(query).toBe("UPDATE users SET name = 'John Doe' WHERE id = '1';");
  });

  it('should build a DELETE query', () => {
    const builder = new QueryBuilder();
    const query = builder
      .table('users')
      .delete()
      .where('id', '=', 1)
      .build();

    expect(query).toBe('DELETE FROM users WHERE id = \'1\';');
  });

  it('should throw an error if no table is specified', () => {
    const builder = new QueryBuilder();
    expect(() => builder.select(['id']).build()).toThrowError(
      'Table name is not specified.'
    );
  });
});
