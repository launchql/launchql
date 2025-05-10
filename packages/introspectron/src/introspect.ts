// @ts-nocheck
import { makeIntrospectionQuery } from './query';
import { parseTags } from './utils';
import flatMap from 'lodash/flatMap';

export const introspect = async (
  pgClient,
  {
    schemas,
    includeExtensions = false,
    pgEnableTags = true,
    pgThrowOnMissingSchema = true
  } = {}
) => {
  const versionResult = await pgClient.query('show server_version_num;');

  const serverVersionNum = parseInt(
    versionResult.rows[0].server_version_num,
    10
  );
  const introspectionQuery = makeIntrospectionQuery(serverVersionNum, {
    pgLegacyFunctionsOnly: false,
    pgIgnoreRBAC: true
  });
  const { rows } = await pgClient.query(introspectionQuery, [
    schemas,
    includeExtensions
  ]);

  const result = {
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
    result[object.kind].push(object);
  }

  // Parse tags from comments
  [
    'namespace',
    'class',
    'attribute',
    'type',
    'constraint',
    'procedure',
    'extension',
    'index'
  ].forEach((kind) => {
    result[kind].forEach((object) => {
      // Keep a copy of the raw comment
      object.comment = object.description;
      if (pgEnableTags && object.description) {
        const parsed = parseTags(object.description);
        object.tags = parsed.tags;
        object.description = parsed.text;
      } else {
        object.tags = {};
      }
    });
  });

  const extensionConfigurationClassIds = flatMap(
    result.extension,
    (e) => e.configurationClassIds
  );
  result.class.forEach((klass) => {
    klass.isExtensionConfigurationTable =
      extensionConfigurationClassIds.indexOf(klass.id) >= 0;
  });

  [
    'namespace',
    'class',
    'attribute',
    'type',
    'constraint',
    'procedure',
    'extension',
    'index'
  ].forEach((k) => {
    result[k].forEach(Object.freeze);
  });

  const knownSchemas = result.namespace.map((n) => n.name);
  const missingSchemas = schemas.filter((s) => knownSchemas.indexOf(s) < 0);
  if (missingSchemas.length) {
    const errorMessage = `You requested to use schema '${schemas.join(
      "', '"
    )}'; however we couldn't find some of those! Missing schemas are: '${missingSchemas.join(
      "', '"
    )}'`;
    if (pgThrowOnMissingSchema) {
      throw new Error(errorMessage);
    } else {
      console.warn('⚠️ WARNING⚠️  ' + errorMessage); // eslint-disable-line no-console
    }
  }
  // return result;
  return Object.freeze(result);
};

// export const processIntrospection = async (pgClient, introspectionResultsByKind) => {

// }
