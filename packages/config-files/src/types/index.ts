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
  project: string;
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

// Config file types
export interface ConfigSection {
  [key: string]: string;
}

export interface ConfigFile {
  [section: string]: ConfigSection;
}

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