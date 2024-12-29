type WhereCondition = {
  column: string;
  operator: string;
  value: any;
};

const RESERVED_KEYWORDS = new Set([
  // Add reserved SQL keywords here (e.g., SELECT, FROM, WHERE, etc.)
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'TABLE', 'USER',
]);

type ValueType = 'string' | 'number' | 'boolean' | 'null';

export class QueryBuilder {
  private tableName: string | null = null;
  private columns: string[] = [];
  private values: Record<string, any> = {};
  private whereConditions: WhereCondition[] = [];
  private limitValue: number | null = null;
  private valueTypes: Record<string, ValueType> = {};

  table(name: string): this {
    this.tableName = name;
    return this;
  }

  select(columns: string[] = ['*']): this {
    this.columns = columns;
    return this;
  }

  insert(values: Record<string, any>): this {
    this.values = values;
    return this;
  }

  update(values: Record<string, any>): this {
    this.values = values;
    return this;
  }

  delete(): this {
    return this;
  }

  where(column: string, operator: string, value: any): this {
    this.whereConditions.push({ column, operator, value });
    return this;
  }

  limit(limit: number): this {
    this.limitValue = limit;
    return this;
  }

  setTypes(types: Record<string, ValueType>): this {
    this.valueTypes = { ...this.valueTypes, ...types };
    return this;
  }

  build(): string {
    if (!this.tableName) {
      throw new Error('Table name is not specified.');
    }

    if (this.columns.length > 0) {
      return this.buildSelectQuery();
    } else if (Object.keys(this.values).length > 0 && this.whereConditions.length > 0) {
      return this.buildUpdateQuery();
    } else if (Object.keys(this.values).length > 0) {
      return this.buildInsertQuery();
    } else {
      return this.buildDeleteQuery();
    }
  }

  private buildSelectQuery(): string {
    const columns = this.columns.map((col) => this.escapeIdentifier(col)).join(', ');
    const whereClause = this.buildWhereClause();
    const limitClause = this.limitValue !== null ? ` LIMIT ${this.limitValue}` : '';
    return `SELECT ${columns} FROM ${this.escapeIdentifier(this.tableName!)}${whereClause}${limitClause};`;
  }

  private buildInsertQuery(): string {
    const columns = Object.keys(this.values).map((col) => this.escapeIdentifier(col)).join(', ');
    const values = Object.entries(this.values)
      .map(([key, value]) => this.formatValue(key, value))
      .join(', ');
    return `INSERT INTO ${this.escapeIdentifier(this.tableName!)} (${columns}) VALUES (${values});`;
  }

  private buildUpdateQuery(): string {
    const setClause = Object.entries(this.values)
      .map(([key, value]) => `${this.escapeIdentifier(key)} = ${this.formatValue(key, value)}`)
      .join(', ');
    const whereClause = this.buildWhereClause();
    return `UPDATE ${this.escapeIdentifier(this.tableName!)} SET ${setClause}${whereClause};`;
  }

  private buildDeleteQuery(): string {
    const whereClause = this.buildWhereClause();
    return `DELETE FROM ${this.escapeIdentifier(this.tableName!)}${whereClause};`;
  }

  private buildWhereClause(): string {
    if (this.whereConditions.length === 0) {
      return '';
    }

    const conditions = this.whereConditions
      .map(
        ({ column, operator, value }) =>
          `${this.escapeIdentifier(column)} ${operator} ${this.formatValue(column, value)}`
      )
      .join(' AND ');

    return ` WHERE ${conditions}`;
  }

  private escapeIdentifier(identifier: string): string {
    if (this.needsQuoting(identifier)) {
      return `"${identifier.replace(/"/g, '""')}"`;
    }
    return identifier;
  }

  private needsQuoting(identifier: string): boolean {
    return (
      RESERVED_KEYWORDS.has(identifier.toUpperCase()) ||
      /[^a-zA-Z0-9_]/.test(identifier) ||
      /^\d/.test(identifier)
    );
  }

  private formatValue(column: string, value: any): string {
    const typeHint = this.valueTypes[column];

    if (typeHint) {
      switch (typeHint) {
      case 'string':
        return `'${value.replace(/'/g, "''")}'`;
      case 'number':
        return `${value}`;
      case 'boolean':
        return value ? 'true' : 'false';
      case 'null':
        return 'NULL';
      default:
        throw new Error(`Unsupported type hint: ${typeHint}`);
      }
    }

    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      return `${value}`;
    } else if (value === null) {
      return 'NULL';
    } else {
      throw new Error(`Unsupported value type: ${typeof value}`);
    }
  }
}
