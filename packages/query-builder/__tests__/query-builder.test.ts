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
      'SELECT id, name, email FROM users WHERE age > 18 LIMIT 10;'
    );
  });

  it('should build an INSERT query', () => {
    const builder = new QueryBuilder();
    const query = builder
      .table('users')
      .insert({ name: 'John', email: 'john@example.com', age: 30 })
      .build();

    expect(query).toBe(
      "INSERT INTO users (name, email, age) VALUES ('John', 'john@example.com', 30);"
    );
  });

  it('should build an UPDATE query', () => {
    const builder = new QueryBuilder();
    const query = builder
      .table('users')
      .update({ name: 'John Doe' })
      .where('id', '=', '1')
      .build();

    expect(query).toBe("UPDATE users SET name = 'John Doe' WHERE id = '1';");
  });

  it('should build a DELETE query', () => {
    const builder = new QueryBuilder();
    const query = builder
      .table('users')
      .delete()
      .where('id', '=', '1')
      .build();

    expect(query).toBe('DELETE FROM users WHERE id = \'1\';');
  });

  it('should build a SELECT query with UUID and numeric conditions', () => {
    const builder = new QueryBuilder();
    const query = builder
      .table('orders')
      .select(['order_id', 'customer_id', 'total'])
      .where('total', '>=', 100.50)
      .where('order_id', '=', '550e8400-e29b-41d4-a716-446655440000')
      .build();

    expect(query).toBe(
      "SELECT order_id, customer_id, total FROM orders WHERE total >= 100.5 AND order_id = '550e8400-e29b-41d4-a716-446655440000';"
    );
  });

  it('should build an UPDATE query with multiple conditions', () => {
    const builder = new QueryBuilder();
    const query = builder
      .table('inventory')
      .update({ stock: 0, price: 1.05, ticker: 'META' })
      .where('product_id', '=', '1234')
      .where('warehouse_id', '=', '5678')
      .build();

    expect(query).toBe(
      "UPDATE inventory SET stock = 0, price = 1.05, ticker = 'META' WHERE product_id = '1234' AND warehouse_id = '5678';"
    );
  });

  it('should build a DELETE query with a composite key', () => {
    const builder = new QueryBuilder();
    const query = builder
      .table('inventory')
      .delete()
      .where('product_id', '=', '1234')
      .where('warehouse_id', '=', '5678')
      .build();

    expect(query).toBe(
      "DELETE FROM inventory WHERE product_id = '1234' AND warehouse_id = '5678';"
    );
  });

  it('should throw an error if no table is specified', () => {
    const builder = new QueryBuilder();
    expect(() => builder.select(['id']).build()).toThrowError(
      'Table name is not specified.'
    );
  });
});
