import generate from '@babel/generator';
import * as t from '@babel/types';

import { DatabaseObject } from '../types';

type CodegenOptions = {
  includeTimestamps: boolean; // Add `type Timestamp = string` if true
  includeUUID: boolean; // Add `type UUID = string` if true
};

export const generateCodeTree = (
  databaseObjects: DatabaseObject[],
  options: CodegenOptions
): Record<string, string> => {
  const { includeTimestamps, includeUUID } = options;

  const schemaFiles: Record<string, t.Statement[]> = {};

  // Add common types to "schemas/_common.ts"
  const commonTypes: t.Statement[] = [];
  if (includeTimestamps) {
    commonTypes.push(
      t.exportNamedDeclaration(
        t.tsTypeAliasDeclaration(
          t.identifier('Timestamp'),
          null,
          t.tsStringKeyword()
        )
      )
    );
  }
  if (includeUUID) {
    commonTypes.push(
      t.exportNamedDeclaration(
        t.tsTypeAliasDeclaration(
          t.identifier('UUID'),
          null,
          t.tsStringKeyword()
        )
      )
    );
  }

  schemaFiles['schemas/_common.ts'] = commonTypes;

  // Organize interfaces by schema (namespace)
  databaseObjects.forEach((obj) => {
    if (obj.kind === 'class' && obj.classKind === 'r') {
      const schemaName = obj.namespaceName;
      const interfaceFields: t.TSPropertySignature[] = [];
      const usedTypes: Set<string> = new Set();

      // Find attributes for the table
      databaseObjects.forEach((attr) => {
        if (attr.kind === 'attribute' && attr.classId === obj.id) {
          const fieldType = mapPostgresTypeToTSType(attr.typeId, attr.isNotNull);

          // Check for UUID or Timestamp usage using the Postgres typeId
          const postgresType = mapPostgresTypeToIdentifier(attr.typeId);
          if (postgresType) {
            usedTypes.add(postgresType); // Track UUID or Timestamp if used
          }

          interfaceFields.push(
            t.tsPropertySignature(
              t.identifier(attr.name),
              t.tsTypeAnnotation(fieldType)
            )
          );
        }
      });

      // Create and export the interface
      const interfaceDeclaration = t.exportNamedDeclaration(
        t.tsInterfaceDeclaration(
          t.identifier(obj.name),
          null,
          [],
          t.tsInterfaceBody(interfaceFields)
        )
      );

      // Add the exported interface and imports to the appropriate schema file
      if (!schemaFiles[`schemas/${schemaName}.ts`]) {
        schemaFiles[`schemas/${schemaName}.ts`] = [];
      }

      // Add imports for UUID and Timestamp from _common, if needed
      if (usedTypes.size > 0) {
        const existingImports = schemaFiles[`schemas/${schemaName}.ts`].find(
          (statement) =>
            t.isImportDeclaration(statement) &&
            statement.source.value === './_common'
        ) as t.ImportDeclaration;

        if (!existingImports) {
          schemaFiles[`schemas/${schemaName}.ts`].unshift(
            t.importDeclaration(
              Array.from(usedTypes).map((type) =>
                t.importSpecifier(t.identifier(type), t.identifier(type))
              ),
              t.stringLiteral('./_common')
            )
          );
        } else {
          // Add any missing import specifiers to the existing import statement
          const existingSpecifiers = new Set(
            existingImports.specifiers.map(
              (specifier) => (specifier.local as t.Identifier).name
            )
          );

          Array.from(usedTypes).forEach((type) => {
            if (!existingSpecifiers.has(type)) {
              existingImports.specifiers.push(
                t.importSpecifier(t.identifier(type), t.identifier(type))
              );
            }
          });
        }
      }

      schemaFiles[`schemas/${schemaName}.ts`].push(interfaceDeclaration);
    }
  });

  // Generate `index.ts` file with exports
  const indexFileStatements: t.Statement[] = [];

  Object.keys(schemaFiles).forEach((filePath) => {
    const schemaName = filePath.replace('schemas/', '').replace('.ts', '');

    if (schemaName === '_common') {
      // Do not export _common from index.ts
      return;
    }

    if (schemaName === 'public') {
      // Export public schema types directly
      indexFileStatements.push(
        t.exportAllDeclaration(t.stringLiteral(`./${filePath.replace('.ts', '')}`))
      );
    } else {
      // Import and re-export with a namespace for other schemas
      indexFileStatements.push(
        t.importDeclaration(
          [t.importNamespaceSpecifier(t.identifier(schemaName))],
          t.stringLiteral(`./${filePath.replace('.ts', '')}`)
        ),
        t.exportNamedDeclaration(
          null,
          [t.exportSpecifier(t.identifier(schemaName), t.identifier(schemaName))]
        )
      );
    }
  });

  // Compile all files into a tree
  const fileTree: Record<string, string> = {};

  Object.entries(schemaFiles).forEach(([filePath, statements]) => {
    const program = t.program(statements);
    fileTree[filePath] = generate(program).code;
  });

  // Generate the `index.ts` file
  const indexProgram = t.program(indexFileStatements);
  fileTree['index.ts'] = generate(indexProgram).code;

  return fileTree;
};

// Map Postgres type OIDs to TypeScript types
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
