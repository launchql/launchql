import type { GraphQLSchema } from 'graphql';

import { createAttributeInflector } from './inflection-utils';
import type { JunctionIndex } from './junction-meta-builders';
import { buildFieldMeta } from './type-mappings';
import type {
  FieldMeta,
  MetaBuild,
  PgAttribute,
  PgCodec,
  PgTableResource,
} from './types';

export type AttributeInflector = (attrName: string, codec: PgCodec) => string;

export interface BuildContext {
  build: MetaBuild;
  inflectAttr: AttributeInflector;
  schema?: GraphQLSchema;
  /** Many-to-many relations implied by detected junction tables. */
  junctions?: JunctionIndex;
  /** Codecs of the junction tables named by a reported many-to-many relation. */
  emittedJunctions?: Set<PgCodec>;
  /** Memo for `exposedColumns`, per table codec. */
  exposedColumns?: Map<PgCodec, Map<string, string | null>>;
}

export type TableResourceWithCodec = PgTableResource & {
  codec: PgCodec & { attributes: Record<string, PgAttribute> };
};

export function createBuildContext(
  build: MetaBuild,
  schema?: GraphQLSchema,
): BuildContext {
  return {
    build,
    inflectAttr: createAttributeInflector(build.inflection),
    schema,
  };
}

export function buildFieldList(
  attrNames: string[],
  codec: PgCodec,
  attributes: Record<string, PgAttribute>,
  context: BuildContext,
): FieldMeta[] {
  return attrNames.map((attrName) =>
    buildFieldMeta(
      context.inflectAttr(attrName, codec),
      attrName,
      attributes[attrName],
      context.build,
    ),
  );
}
