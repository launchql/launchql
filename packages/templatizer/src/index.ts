import moduleTemplate from './generated/module';
import workspaceTemplate from './generated/workspace';
import { writeRenderedTemplates } from './templatize/generateFromCompiled';
import { loadTemplates } from './loadTemplates';

// Re-export TemplateSource interface (defined inline to avoid TypeScript resolution issues)
export interface TemplateSource {
  type: 'local' | 'github';
  path: string;
  branch?: string;
}

export {
  moduleTemplate,
  workspaceTemplate,
  writeRenderedTemplates,
  loadTemplates
};

export { extractVarNamesFromString, extractVarNamesFromDir } from './discovery';
export { loadQuestions, normalizeQuestionName, type Question } from './questions';
export { renderStrict, validateRequiredVars, type RenderOptions } from './render';
