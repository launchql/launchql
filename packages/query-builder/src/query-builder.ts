type WhereCondition = {
  column: string;
  operator: string;
  value: any;
};

type ValueType = 'string' | 'number' | 'boolean' | 'null';

const RESERVED_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'TABLE', 'USER',
]);

export class QueryBuilder {
  private schemaName: string | null = null;
  private entityName: string | null = null;
  private columns: string[] = [];
  private values: Record<string, any> = {};
  private whereConditions: WhereCondition[] = [];
  private joins: { type: string; schema: string | null; table: string; on: string }[] = [];
  private groupByColumns: string[] = [];
  private orderByColumns: { column: string; direction: 'ASC' | 'DESC' }[] = [];
  private limitValue: number | null = null;
  private parameters: any[] = [];
  private valueTypes: Record<string, ValueType> = {};
  private isProcedureCall: boolean = false;

  schema(schema: string): this {
    this.schemaName = schema;
    return this;
  }

  table(name: string): this {
    this.entityName = name;
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

  call(procedure: string, args: any[] | Record<string, any> = []): this {
    this.isProcedureCall = true; // Mark as a procedure call
    const escapedProcedure = this.escapeIdentifier(procedure);
    const escapedSchema = this.schemaName ? `${this.escapeIdentifier(this.schemaName)}.` : '';
  
    let argsClause = '()';
  
    if (Array.isArray(args)) {
      // Handle array of arguments
      const formattedArgs = args.map((arg) => this.formatValue('', arg)).join(', ');
      argsClause = args.length > 0 ? `(${formattedArgs})` : '()';
    } else if (typeof args === 'object' && args !== null) {
      // Handle keyed object for named parameters
      const formattedArgs = Object.entries(args)
        .map(([key, value]) => `${this.escapeIdentifier(key)} := ${this.formatValue(key, value)}`)
        .join(', ');
      argsClause = Object.keys(args).length > 0 ? `(${formattedArgs})` : '()';
    }
  
    this.entityName = `${escapedSchema}${escapedProcedure}${argsClause}`;
  
    return this;
  }
  
  
  where(column: string, operator: string, value: any): this {
    this.whereConditions.push({ column, operator, value });
    this.parameters.push(value);
    return this;
  }

  join(type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL', table: string, on: string, schema: string | null = null): this {
    this.joins.push({ type, schema, table, on });
    return this;
  }

  groupBy(columns: string[]): this {
    this.groupByColumns.push(...columns);
    return this;
  }

  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderByColumns.push({ column, direction });
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
    if (!this.entityName) {
      throw new Error('Table name or procedure name is not specified.');
    }
  
    let query;
  
    if (this.isProcedureCall) {
      query = this.buildProcedureCall();
    } else if (this.columns.length > 0) {
      query = this.buildSelectQuery();
    } else if (Object.keys(this.values).length > 0 && this.whereConditions.length > 0) {
      query = this.buildUpdateQuery();
    } else if (Object.keys(this.values).length > 0) {
      query = this.buildInsertQuery();
    } else {
      query = this.buildDeleteQuery();
    }
  
    return query;
  }
  

  private buildSelectQuery(): string {
    const columns = this.columns.map((col) => this.escapeIdentifier(col)).join(', ');
    const joins = this.buildJoinClause();
    const whereClause = this.buildWhereClause();
    const groupByClause = this.buildGroupByClause();
    const orderByClause = this.buildOrderByClause();
    const limitClause = this.limitValue !== null ? ` LIMIT ${this.limitValue}` : '';
    const fullyQualifiedTable = this.getFullyQualifiedTable();

    return `SELECT ${columns} FROM ${fullyQualifiedTable}${joins}${whereClause}${groupByClause}${orderByClause}${limitClause};`;
  }

  private buildProcedureCall(): string {
    if (!this.entityName) {
      throw new Error('Procedure name is not specified.');
    }
  
    const procedureCall = this.entityName;
    const columns = this.columns.map((col) => this.escapeIdentifier(col)).join(', ');
  
    if (this.columns.length > 0) {
      // If specific columns are selected
      return `SELECT ${columns} FROM ${procedureCall};`;
    }
  
    // Default: SELECT procedure()
    return `SELECT ${procedureCall};`;
  }
  
  private buildInsertQuery(): string {
    const columns = Object.keys(this.values).map((col) => this.escapeIdentifier(col)).join(', ');
    const values = Object.entries(this.values)
      .map(([key, value]) => this.formatValue(key, value)) // Use formatValue here
      .join(', ');
    const fullyQualifiedTable = this.getFullyQualifiedTable();
  
    return `INSERT INTO ${fullyQualifiedTable} (${columns}) VALUES (${values});`;
  }
  
  private buildUpdateQuery(): string {
    const setClause = Object.entries(this.values)
      .map(([key, value]) => `${this.escapeIdentifier(key)} = ${this.formatValue(key, value)}`) // Use formatValue here
      .join(', ');
    const whereClause = this.buildWhereClause();
    const fullyQualifiedTable = this.getFullyQualifiedTable();
  
    return `UPDATE ${fullyQualifiedTable} SET ${setClause}${whereClause};`;
  }
  
  private buildDeleteQuery(): string {
    const fullyQualifiedTable = this.getFullyQualifiedTable();
    const whereClause = this.buildWhereClause();
    return `DELETE FROM ${fullyQualifiedTable}${whereClause};`;
  }

  private buildJoinClause(): string {
    return this.joins
      .map(({ type, schema, table, on }) => {
        const fullyQualifiedJoinTable = schema
          ? `${this.escapeIdentifier(schema)}.${this.escapeIdentifier(table)}`
          : this.escapeIdentifier(table);
        return ` ${type} JOIN ${fullyQualifiedJoinTable} ON ${on}`;
      })
      .join('');
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
  
  private buildGroupByClause(): string {
    if (this.groupByColumns.length === 0) {
      return '';
    }
    const groupBy = this.groupByColumns.map((col) => this.escapeIdentifier(col)).join(', ');
    return ` GROUP BY ${groupBy}`;
  }
  
  private buildOrderByClause(): string {
    if (this.orderByColumns.length === 0) {
      return '';
    }
    const orderBy = this.orderByColumns
      .map(({ column, direction }) => `${this.escapeIdentifier(column)} ${direction}`)
      .join(', ');
    return ` ORDER BY ${orderBy}`;
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

  private getFullyQualifiedTable(): string {
    const escapedSchema = this.schemaName ? this.escapeIdentifier(this.schemaName) : null;
    const escapedTable = this.escapeIdentifier(this.entityName!);

    if (escapedSchema) {
      return `${escapedSchema}.${escapedTable}`;
    }
    return escapedTable;
  }
}
