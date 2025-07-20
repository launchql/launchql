export interface IntrospectionQueryResult {
    __schema: {
      queryType: { name: string };
      mutationType: { name: string } | null;
      subscriptionType: { name: string } | null;
      types: IntrospectionType[];
      directives: IntrospectionDirective[];
    };
  }
  
export interface IntrospectionDirective {
    name: string;
    description?: string | null;
    locations: string[];
    args: IntrospectionInputValue[];
  }
  
export interface IntrospectionType {
    kind: TypeKind;
    name: string;
    description?: string | null;
    fields?: IntrospectionField[] | null;
    inputFields?: IntrospectionInputValue[] | null;
    interfaces?: IntrospectionTypeRef[] | null;
    enumValues?: IntrospectionEnumValue[] | null;
    possibleTypes?: IntrospectionTypeRef[] | null;
  }
  
export interface IntrospectionField {
    name: string;
    description?: string | null;
    args: IntrospectionInputValue[];
    type: IntrospectionTypeRef;
    isDeprecated: boolean;
    deprecationReason?: string | null;
  }
  
export interface IntrospectionInputValue {
    name: string;
    description?: string | null;
    type: IntrospectionTypeRef;
    defaultValue?: string | null;
  }
  
export interface IntrospectionEnumValue {
    name: string;
    description?: string | null;
    isDeprecated: boolean;
    deprecationReason?: string | null;
  }
  
export interface IntrospectionTypeRef {
    kind: TypeKind;
    name?: string | null;
    ofType?: IntrospectionTypeRef | null;
  }
  
export type TypeKind =
    | 'SCALAR'
    | 'OBJECT'
    | 'INTERFACE'
    | 'UNION'
    | 'ENUM'
    | 'INPUT_OBJECT'
    | 'LIST'
    | 'NON_NULL';
  