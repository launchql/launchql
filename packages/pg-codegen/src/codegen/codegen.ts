import generate from '@babel/generator';
import * as t from '@babel/types';

import { DatabaseObject } from '../types';

type CodegenOptions = {
  includeTimestamps: boolean;
  includeUUID: boolean;
};

export const generateCodeTree = (
  databaseObjects: DatabaseObject[],
  options: CodegenOptions
): Record<string, string> => {
  const { includeTimestamps, includeUUID } = options;
  const schemaFiles: Record<string, t.Statement[]> = {};

  // Common types
  const commonTypes: t.Statement[] = [];
  if (includeTimestamps) {
    commonTypes.push(
      t.exportNamedDeclaration(
        t.tsTypeAliasDeclaration(t.identifier('Timestamp'), null, t.tsStringKeyword())
      )
    );
  }
  if (includeUUID) {
    commonTypes.push(
      t.exportNamedDeclaration(
        t.tsTypeAliasDeclaration(t.identifier('UUID'), null, t.tsStringKeyword())
      )
    );
  }
  schemaFiles['schemas/_common.ts'] = commonTypes;

  // Classes & Interfaces per schema
  databaseObjects.forEach((obj) => {
    if (obj.kind === 'class' && obj.classKind === 'r') {
      const schemaName = obj.namespaceName;
      const pascalName = toPascalCase(obj.name);

      const interfaceFields: t.TSPropertySignature[] = [];
      const classFields: t.ClassProperty[] = [];
      const constructorBody: t.Statement[] = [];
      const usedTypes: Set<string> = new Set();

      databaseObjects.forEach((attr) => {
        if (attr.kind === 'attribute' && attr.classId === obj.id) {
          const fieldType = mapPostgresTypeToTSType(attr.typeId, attr.isNotNull);
          const postgresType = mapPostgresTypeToIdentifier(attr.typeId);
          if (postgresType) usedTypes.add(postgresType);

          interfaceFields.push(
            t.tsPropertySignature(t.identifier(attr.name), t.tsTypeAnnotation(fieldType))
          );

          classFields.push(
            t.classProperty(t.identifier(attr.name), undefined, t.tsTypeAnnotation(fieldType))
          );

          constructorBody.push(
            t.expressionStatement(
              t.assignmentExpression(
                '=',
                t.memberExpression(t.thisExpression(), t.identifier(attr.name)),
                t.memberExpression(t.identifier('data'), t.identifier(attr.name))
              )
            )
          );
        }
      });

      const interfaceDeclaration = t.exportNamedDeclaration(
        t.tsInterfaceDeclaration(
          t.identifier(pascalName),
          null,
          [],
          t.tsInterfaceBody(interfaceFields)
        )
      );

      const data = t.identifier('data');
      data.typeAnnotation = t.tsTypeAnnotation(t.tsTypeReference(t.identifier(pascalName)));

      const classImplements = t.tsExpressionWithTypeArguments(t.identifier(pascalName));
      const classDeclaration = t.exportNamedDeclaration(
        t.classDeclaration(
          t.identifier(pascalName),
          null,
          t.classBody([
            ...classFields,
            t.classMethod('constructor', t.identifier('constructor'), [data], t.blockStatement(constructorBody))
          ])
        )
      );
      (classDeclaration.declaration as t.ClassDeclaration).implements = [classImplements];

      const filePath = `schemas/${schemaName}.ts`;
      if (!schemaFiles[filePath]) schemaFiles[filePath] = [];

      if (usedTypes.size > 0) {
        const existingImports = schemaFiles[filePath].find(
          (s) => t.isImportDeclaration(s) && s.source.value === './_common'
        ) as t.ImportDeclaration;

        if (!existingImports) {
          schemaFiles[filePath].unshift(
            t.importDeclaration(
              Array.from(usedTypes).map((type) =>
                t.importSpecifier(t.identifier(type), t.identifier(type))
              ),
              t.stringLiteral('./_common')
            )
          );
        } else {
          const current = new Set(existingImports.specifiers.map((s) => (s.local as t.Identifier).name));
          Array.from(usedTypes).forEach((type) => {
            if (!current.has(type)) {
              existingImports.specifiers.push(
                t.importSpecifier(t.identifier(type), t.identifier(type))
              );
            }
          });
        }
      }

      schemaFiles[filePath].push(interfaceDeclaration, classDeclaration);
    }
  });

  // index.ts exports
  const indexFileStatements: t.Statement[] = [];
  Object.keys(schemaFiles).forEach((filePath) => {
    const schemaName = filePath.replace('schemas/', '').replace('.ts', '');
    if (schemaName === '_common') return;

    if (schemaName === 'public') {
      indexFileStatements.push(
        t.exportAllDeclaration(t.stringLiteral(`./${filePath.replace('.ts', '')}`))
      );
    } else {
      indexFileStatements.push(
        t.importDeclaration(
          [t.importNamespaceSpecifier(t.identifier(schemaName))],
          t.stringLiteral(`./${filePath.replace('.ts', '')}`)
        ),
        t.exportNamedDeclaration(null, [
          t.exportSpecifier(t.identifier(schemaName), t.identifier(schemaName))
        ])
      );
    }
  });

  const fileTree: Record<string, string> = {};
  Object.entries(schemaFiles).forEach(([filePath, statements]) => {
    // @ts-ignore
    fileTree[filePath] = generate(t.program(statements)).code;
  });
  
  // @ts-ignore
  fileTree['index.ts'] = generate(t.program(indexFileStatements)).code;
  return fileTree;
};

const toPascalCase = (str: string): string =>
  str
    .replace(/[_-](\w)/g, (_, c) => c.toUpperCase())
    .replace(/^\w/, (c) => c.toUpperCase());

const mapPostgresTypeToTSType = (typeId: string, isNotNull: boolean): t.TSType => {
  const optionalType = (type: t.TSType): t.TSType =>
    isNotNull ? type : t.tsUnionType([type, t.tsNullKeyword()]);
  switch (typeId) {
  case '20': // BIGINT
  case '21': // SMALLINT
  case '23': // INTEGER
  case '1700': // NUMERIC
    return optionalType(t.tsNumberKeyword());
  case '25': // TEXT
  case '1043': // VARCHAR
    return optionalType(t.tsStringKeyword());
  case '1114': // TIMESTAMP
  case '1184': // TIMESTAMPTZ
    return optionalType(t.tsTypeReference(t.identifier('Timestamp')));
  case '2950': // UUID
    return optionalType(t.tsTypeReference(t.identifier('UUID')));
  case '16': // BOOLEAN
    return optionalType(t.tsBooleanKeyword());
  default:
    return optionalType(t.tsAnyKeyword());
  }
};

// Map Postgres type OIDs to type names for imports
const mapPostgresTypeToIdentifier = (typeId: string): string | null => {
  switch (typeId) {
  case '1114': // TIMESTAMP
  case '1184': // TIMESTAMPTZ
    return 'Timestamp';
  case '2950': // UUID
    return 'UUID';
  default:
    return null;
  }
};
