import moduleTemplate from './generated/module';
import workspaceTemplate from './generated/workspace';
import { writeRenderedTemplates } from './templatize/generateFromCompiled';
import { loadTemplates, resolveTemplateDirectory } from './loadTemplates';
import {
  extractTemplateVariables,
  loadTemplateQuestions,
  computeMissingVariables,
  generateVariableDefaults,
  convertToInquirerQuestions,
  TemplateQuestion
} from './templateVariables';

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
  loadTemplates,
  resolveTemplateDirectory,
  extractTemplateVariables,
  loadTemplateQuestions,
  computeMissingVariables,
  generateVariableDefaults,
  convertToInquirerQuestions,
  TemplateQuestion
};
