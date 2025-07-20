import { RawStmt } from '@pgsql/types';
import { deparse,parse } from 'pgsql-parser';

const filterStatements = (stmts: RawStmt[]): { filteredStmts: RawStmt[], hasFiltered: boolean } => {
  const filteredStmts = stmts.filter(node => {
    const stmt = node.stmt;
    return stmt && !stmt.hasOwnProperty('TransactionStmt') && 
           !stmt.hasOwnProperty('CreateExtensionStmt');
  });
  
  const hasFiltered = filteredStmts.length !== stmts.length;
  return { filteredStmts, hasFiltered };
};

export const cleanSql = async (
  sql: string, 
  pretty: boolean, 
  functionDelimiter: string
): Promise<string> => {
  const parsed = await parse(sql);
  const { filteredStmts, hasFiltered } = filterStatements(parsed.stmts as any);
  
  if (!hasFiltered) {
    return sql;
  }
  
  parsed.stmts = filteredStmts;
  
  const finalSql = await deparse(parsed, {
    pretty,
    functionDelimiter
  });

  return finalSql;
};
