import ast, { DeleteStmt,InsertStmt, SelectStmt, UpdateStmt } from '@pgsql/utils';

import Deparser from './deparser';

const deparse = Deparser.deparse;

type WhereCondition = {
  column: string;
  operator: string;
  value: any;
};

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

    let queryAST;
    if (this.columns.length > 0) {
      queryAST = this.buildSelectAST();
    } else if (Object.keys(this.values).length > 0) {
      queryAST = this.columns.length ? this.buildUpdateAST() : this.buildInsertAST();
    } else {
      queryAST = this.buildDeleteAST();
    }

    return deparse(queryAST, {});
  }

  private buildSelectAST(): SelectStmt {
    return ast.selectStmt({
      targetList: this.columns.map((col) =>
        ast.resTarget({
          val: ast.columnRef({ fields: [ast.string({ str: col })] }),
        })
      ),
      fromClause: [
        ast.rangeVar({
          relname: this.tableName,
        }),
      ],
      whereClause: this.buildWhereAST(),
      limitCount: this.limitValue
        ? ast.aConst({
          val: ast.integer({ ival: this.limitValue }),
        })
        : undefined,
    });
  }

  private buildInsertAST(): InsertStmt {
    return ast.insertStmt({
      relation: ast.rangeVar({ relname: this.tableName }),
      cols: Object.keys(this.values).map((col) =>
        ast.columnRef({ fields: [ast.string({ str: col })] })
      ),
      selectStmt: ast.selectStmt({
        valuesLists: [
          // @ts-ignore
          Object.values(this.values).map((value) =>
            ast.aConst({ val: ast.string({ str: value.toString() }) })
          ),
        ],
      }),
    });
  }

  private buildUpdateAST(): UpdateStmt {
    return ast.updateStmt({
      relation: ast.rangeVar({ relname: this.tableName }),
      targetList: Object.keys(this.values).map((col) =>
        ast.resTarget({
          name: col,
          val: ast.aConst({
            val: ast.string({ str: this.values[col].toString() }),
          }),
        })
      ),
      whereClause: this.buildWhereAST(),
    });
  }

  private buildDeleteAST(): DeleteStmt {
    return ast.deleteStmt({
      relation: ast.rangeVar({ relname: this.tableName }),
      whereClause: this.buildWhereAST(),
    });
  }

  private buildWhereAST(): any | undefined {
    if (this.whereConditions.length === 0) {
      return undefined;
    }

    return this.whereConditions
      .map(({ column, operator, value }) =>
        ast.aExpr({
          kind: 'AEXPR_OP',
          name: [ast.string({ str: operator })],
          lexpr: ast.columnRef({ fields: [ast.string({ str: column })] }),
          rexpr: ast.aConst({
            val: ast.string({ str: value.toString() }),
          }),
        })
      )
      // @ts-ignore
      .reduce((prev, curr) => {
        return ast.boolExpr({
          boolop: 'AND_EXPR',
          args: [prev, curr],
        });
      });
  }
}
