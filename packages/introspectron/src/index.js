import { makeIntrospectionQuery } from './introspect';
import { parseTags } from './utils';
import flatMap from 'lodash/flatMap';

export const introspect = async (
  pgClient,
  { schemas, includeExtensions = false, pgEnableTags = true } = {}
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

  return Object.freeze(result);
};
