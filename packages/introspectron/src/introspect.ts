import type { ClientBase } from 'pg';

import type { PgIntrospectionResultByKind } from './pg-types';
import { makeIntrospectionQuery } from './query';
import { parseTags } from './utils';

interface IntrospectOptions {
  schemas: string[];
  includeExtensions?: boolean;
  pgEnableTags?: boolean;
  pgThrowOnMissingSchema?: boolean;
}

type PgIntrospectionKind =
  | 'namespace'
  | 'class'
  | 'attribute'
  | 'type'
  | 'constraint'
  | 'procedure'
  | 'extension'
  | 'index';

type IntrospectedObject = {
  kind: PgIntrospectionKind;
  id: string | number;
  name: string;
  description?: string;
  comment?: string;
  tags?: Record<string, any>;
  [key: string]: any;
};

export const introspect = async (
  pgClient: ClientBase,
  {
    schemas,
    includeExtensions = false,
    pgEnableTags = true,
    pgThrowOnMissingSchema = true
  }: IntrospectOptions
): Promise<PgIntrospectionResultByKind> => {
  const versionResult = await pgClient.query('show server_version_num;');
  const serverVersionNum = parseInt(versionResult.rows[0].server_version_num, 10);

  const introspectionQuery = makeIntrospectionQuery(serverVersionNum, {
    pgLegacyFunctionsOnly: false,
    pgIgnoreRBAC: true
  });

  const { rows }: { rows: { object: IntrospectedObject }[] } = await pgClient.query(
    introspectionQuery,
    [schemas, includeExtensions]
  );

  const result: PgIntrospectionResultByKind = {
    __pgVersion: serverVersionNum,
    namespace: [],
    class: [],
    attribute: [],
    type: [],
    constraint: [],
    procedure: [],
    extension: [],
    index: []
  };

  for (const { object } of rows) {
    (result[object.kind] as IntrospectedObject[]).push(object);
  }

  const kinds: PgIntrospectionKind[] = [
    'namespace',
    'class',
    'attribute',
    'type',
    'constraint',
    'procedure',
    'extension',
    'index'
  ];

  for (const kind of kinds) {
    for (const object of result[kind] as IntrospectedObject[]) {
      object.comment = object.description;
      if (pgEnableTags && object.description) {
        const parsed = parseTags(object.description);
        object.tags = parsed.tags;
        object.description = parsed.text;
      } else {
        object.tags = {};
      }
    }
  }

  const extensionConfigurationClassIds = (result.extension as any[]).flatMap(
    (e) => e.configurationClassIds || []
  );
  for (const klass of result.class as any[]) {
    klass.isExtensionConfigurationTable =
      extensionConfigurationClassIds.includes(klass.id);
  }

  for (const kind of kinds) {
    for (const obj of result[kind] as object[]) {
      Object.freeze(obj);
    }
  }

  const knownSchemas = result.namespace.map((n: any) => n.name);
  const missingSchemas = schemas.filter((s) => !knownSchemas.includes(s));

  if (missingSchemas.length > 0) {
    const errorMessage = `You requested to use schema '${schemas.join(
      "', '"
    )}'; however we couldn't find some of those! Missing schemas are: '${missingSchemas.join(
      "', '"
    )}'`;
    if (pgThrowOnMissingSchema) {
      throw new Error(errorMessage);
    } else {
      console.warn('⚠️ WARNING⚠️  ' + errorMessage);
    }
  }

  return Object.freeze(result);
};
