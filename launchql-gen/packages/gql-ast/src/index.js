export const document = ({ definitions }) => ({
  kind: 'Document',
  definitions
});

export const operationDefinition = ({
  operation,
  name,
  variableDefinitions = [],
  directives = [],
  selectionSet
}) => ({
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

export const variableDefinition = ({ variable, type, directives }) => ({
  kind: 'VariableDefinition',
  variable,
  type,
  directives
});

export const selectionSet = ({ selections }) => ({
  kind: 'SelectionSet',
  selections
});

export const listType = ({ type }) => ({
  kind: 'ListType',
  type
});

export const nonNullType = ({ type }) => ({
  kind: 'NonNullType',
  type
});

export const namedType = ({ type }) => ({
  kind: 'NamedType',
  name: {
    kind: 'Name',
    value: type
  }
});

export const variable = ({ name }) => ({
  kind: 'Variable',
  name: {
    kind: 'Name',
    value: name
  }
});

export const objectValue = ({ fields }) => ({
  kind: 'ObjectValue',
  fields
});

export const stringValue = ({ value }) => ({
  kind: 'StringValue',
  value
});

export const intValue = ({ value }) => ({
  kind: 'IntValue',
  value
});

export const booleanValue = ({ value }) => ({
  kind: 'BooleanValue',
  value
});

export const listValue = ({ values }) => ({
  kind: 'ListValue',
  values
});

export const nullValue = () => ({
  kind: 'NullValue'
});

export const fragmentDefinition = ({
  name,
  typeCondition,
  directives,
  selectionSet
}) => ({
  kind: 'FragmentDefinition',
  name: {
    kind: 'Name',
    value: name
  },
  typeCondition,
  directives,
  selectionSet
});

export const objectField = ({ name, value }) => ({
  kind: 'ObjectField',
  name: {
    kind: 'Name',
    value: name
  },
  value
});

export const field = ({ name, args, directives, selectionSet }) => ({
  kind: 'Field',
  name: {
    kind: 'Name',
    value: name
  },
  arguments: args,
  directives,
  selectionSet
});

export const argument = ({ name, value }) => ({
  kind: 'Argument',
  name: {
    kind: 'Name',
    value: name
  },
  value
});
