type WhereCondition = {
  column: string;
  operator: string;
  value: any;
};

const RESERVED_KEYWORDS = new Set([
  // Add reserved SQL keywords here (e.g., SELECT, FROM, WHERE, etc.)
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'TABLE', 'USER',
]);

export class QueryBuilder {
  private tableName: string | null = null;
  private columns: string[] = [];
  private values: Record<string, any> = {};
  private whereConditions: WhereCondition[] = [];
  private limitValue: number | null = null;

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

  build(): string {
    if (!this.tableName) {
      throw new Error('Table name is not specified.');
    }
  
    if (this.columns.length > 0) {
      return this.buildSelectQuery();
    } else if (Object.keys(this.values).length > 0 && this.whereConditions.length > 0) {
      // Generate an UPDATE query if values and whereConditions are present
      return this.buildUpdateQuery();
    } else if (Object.keys(this.values).length > 0) {
      // Generate an INSERT query if only values are present
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
    const values = Object.values(this.values)
      .map((value) => `'${value}'`)
      .join(', ');
    return `INSERT INTO ${this.escapeIdentifier(this.tableName!)} (${columns}) VALUES (${values});`;
  }

  private buildUpdateQuery(): string {
    const setClause = Object.entries(this.values)
      .map(([key, value]) => `${this.escapeIdentifier(key)} = '${value}'`)
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
          `${this.escapeIdentifier(column)} ${operator} '${value}'`
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
}
