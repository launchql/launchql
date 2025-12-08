import { buildASTSchema, GraphQLSchema, parse } from "graphql";
import { lexicographicSortSchema, printSchema } from "graphql/utilities";

export const printSchemaOrdered = (originalSchema: GraphQLSchema): string => {
  const schema = buildASTSchema(parse(printSchema(originalSchema)));
  return printSchema(lexicographicSortSchema(schema));
};
