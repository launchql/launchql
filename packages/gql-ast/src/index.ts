import {
  ArgumentNode,
  BooleanValueNode,
  DefinitionNode,
  DirectiveNode,
  DocumentNode,
  FieldNode,
  FragmentDefinitionNode,
  IntValueNode,
  ListTypeNode,
  ListValueNode,
  NamedTypeNode,
  // NameNode,
  NullValueNode,
  ObjectFieldNode,
  ObjectValueNode,
  OperationDefinitionNode,
  OperationTypeNode,
  SelectionSetNode,
  StringValueNode,
  TypeNode,
  VariableDefinitionNode,
  VariableNode
} from 'graphql';

export const document = ({ definitions }: { definitions: DefinitionNode[] }): DocumentNode => ({
  kind: 'Document',
  definitions
});

export const operationDefinition = ({
  operation,
  name,
  variableDefinitions = [],
  directives = [],
  selectionSet
}: {
  operation: OperationTypeNode;
  name: string;
  variableDefinitions?: VariableDefinitionNode[];
  directives?: DirectiveNode[];
  selectionSet: SelectionSetNode;
}): OperationDefinitionNode => ({
  kind: 'OperationDefinition',
  operation,
  name: {
    kind: 'Name',
    value: name
  },
  variableDefinitions,
  directives,
  selectionSet
});

export const variableDefinition = ({
  variable,
  type,
  directives
}: {
  variable: VariableNode;
  type: TypeNode;
  directives?: DirectiveNode[];
}): VariableDefinitionNode => ({
  kind: 'VariableDefinition',
  variable,
  type,
  directives: directives || []
});

export const selectionSet = ({ selections }: { selections: readonly FieldNode[] }): SelectionSetNode => ({
  kind: 'SelectionSet',
  selections
});

export const listType = ({ type }: { type: TypeNode }): ListTypeNode => ({
  kind: 'ListType',
  type
});

export const nonNullType = ({ type }: { type: NamedTypeNode | ListTypeNode }): TypeNode => ({
  kind: 'NonNullType',
  type
});

export const namedType = ({ type }: { type: string }): NamedTypeNode => ({
  kind: 'NamedType',
  name: {
    kind: 'Name',
    value: type
  }
});

export const variable = ({ name }: { name: string }): VariableNode => ({
  kind: 'Variable',
  name: {
    kind: 'Name',
    value: name
  }
});

export const objectValue = ({ fields }: { fields: ObjectFieldNode[] }): ObjectValueNode => ({
  kind: 'ObjectValue',
  fields
});

export const stringValue = ({ value }: { value: string }): StringValueNode => ({
  kind: 'StringValue',
  value
});

export const intValue = ({ value }: { value: string }): IntValueNode => ({
  kind: 'IntValue',
  value
});

export const booleanValue = ({ value }: { value: boolean }): BooleanValueNode => ({
  kind: 'BooleanValue',
  value
});

export const listValue = ({ values }: { values: any[] }): ListValueNode => ({
  kind: 'ListValue',
  values
});

export const nullValue = (): NullValueNode => ({
  kind: 'NullValue'
});

export const fragmentDefinition = ({
  name,
  typeCondition,
  directives = [],
  selectionSet
}: {
  name: string;
  typeCondition: NamedTypeNode;
  directives?: DirectiveNode[];
  selectionSet: SelectionSetNode;
}): FragmentDefinitionNode => ({
  kind: 'FragmentDefinition',
  name: {
    kind: 'Name',
    value: name
  },
  typeCondition,
  directives,
  selectionSet
});

export const objectField = ({ name, value }: { name: string; value: any }): ObjectFieldNode => ({
  kind: 'ObjectField',
  name: {
    kind: 'Name',
    value: name
  },
  value
});

export const field = ({
  name,
  args = [],
  directives = [],
  selectionSet
}: {
  name: string;
  args?: ArgumentNode[];
  directives?: DirectiveNode[];
  selectionSet?: SelectionSetNode;
}): FieldNode => ({
  kind: 'Field',
  name: {
    kind: 'Name',
    value: name
  },
  arguments: args,
  directives,
  selectionSet
});

export const argument = ({ name, value }: { name: string; value: any }): ArgumentNode => ({
  kind: 'Argument',
  name: {
    kind: 'Name',
    value: name
  },
  value
});
