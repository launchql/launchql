export * from './package';

// Plan file types
export interface Change {
  name: string;
  dependencies: string[];
  timestamp?: string;
  planner?: string;
  email?: string;
  comment?: string;
}

export interface PlanFile {
  package: string;
  uri?: string;
  changes: Change[];
}

export interface Tag {
  name: string;
  change: string;
  timestamp?: string;
  planner?: string;
  email?: string;
  comment?: string;
}

export interface ExtendedPlanFile extends PlanFile {
  tags: Tag[];
}

// Config file types have been removed

// Parser result types
export interface ParseError {
  line: number;
  message: string;
}

export interface ParseResult<T> {
  data?: T;
  errors: ParseError[];
}

// Reference types for plan parsing
export interface ResolvedReference {
  type: 'change' | 'tag' | 'sha1' | 'relative';
  target: string;
  resolved?: string;
}

// SQL file types
export interface SqitchRow {
  deploy: string;
  revert?: string;
  verify?: string;
  content: string;
  deps?: string[];
  name?: string;
}
