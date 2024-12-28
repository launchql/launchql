import generate from '@babel/generator';
import * as t from '@babel/types';

import { DatabaseObject } from '../types';

type CodegenOptions = {
  includeTimestamps: boolean; // Add `type Timestamp = string` if true
  includeUUID: boolean; // Add `type UUID = string` if true
};

export const generateCode = (databaseObjects: DatabaseObject[], options: CodegenOptions): string => {
  const { includeTimestamps, includeUUID } = options;

  const namespaces: Record<string, t.Statement[]> = {};

  // Organize objects by namespace
  databaseObjects.forEach((obj) => {
    if (obj.kind === 'namespace') {
      namespaces[obj.name] = [];
    }
  });

  // Generate interfaces for tables (Class objects with kind 'r')
  databaseObjects.forEach((obj) => {
    if (obj.kind === 'class' && obj.classKind === 'r') {
      const namespace = obj.namespaceName;
      const fields: t.TSPropertySignature[] = [];

      // Find attributes for the class
      databaseObjects.forEach((attr) => {
        if (attr.kind === 'attribute' && attr.classId === obj.id) {
          fields.push(
            t.tsPropertySignature(
              t.identifier(attr.name),
              t.tsTypeAnnotation(
                mapPostgresTypeToTSType(attr.typeId, attr.isNotNull)
              )
            )
          );
        }
      });

      // Create the interface declaration
      const interfaceDeclaration = t.tsInterfaceDeclaration(
        t.identifier(obj.name),
        null,
        [],
        t.tsInterfaceBody(fields)
      );

      // Add to the namespace
      if (namespaces[namespace]) {
        namespaces[namespace].push(interfaceDeclaration);
      }
    }
  });

  // Generate the final AST
  const programBody: t.Statement[] = [];

  if (includeTimestamps) {
    programBody.push(
      t.tsTypeAliasDeclaration(
        t.identifier('Timestamp'),
        null,
        t.tsStringKeyword()
      )
    );
  }

  if (includeUUID) {
    programBody.push(
      t.tsTypeAliasDeclaration(t.identifier('UUID'), null, t.tsStringKeyword())
    );
  }

  Object.keys(namespaces).forEach((namespace) => {
    const namespaceDeclaration = t.tsModuleDeclaration(
      t.identifier(namespace),
      t.tsModuleBlock(namespaces[namespace])
    );
    namespaceDeclaration.declare = true;
    programBody.push(namespaceDeclaration);
  });

  const program = t.program(programBody);

  // Generate the code
  return generate(program).code;
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
