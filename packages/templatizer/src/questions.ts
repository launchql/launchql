import fs from 'fs';
import path from 'path';

/**
 * Question interface matching inquirerer's Question type
 * This is a simplified version that covers the common fields
 */
export interface Question {
  name: string;
  message?: string;
  type?: string;
  required?: boolean;
  default?: any;
  choices?: string[];
  [key: string]: any;
}

/**
 * Normalize a question name by stripping leading and trailing double underscores
 * This converts __VARNAME__ to VARNAME to match the compiled template keys
 * @param nameWithUnderscores - Variable name with underscores (e.g., "__MODULENAME__")
 * @returns Normalized variable name (e.g., "MODULENAME")
 */
export function normalizeQuestionName(nameWithUnderscores: string): string {
  return nameWithUnderscores.replace(/^__/, '').replace(/__$/, '');
}

/**
 * Load questions from a .questions.json file in the template directory
 * @param templateDir - Path to the template directory
 * @returns Array of questions, or empty array if file doesn't exist
 */
export function loadQuestions(templateDir: string): Question[] {
  const questionsPath = path.join(templateDir, '.questions.json');
  
  if (!fs.existsSync(questionsPath)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(questionsPath, 'utf8');
    const questions = JSON.parse(content);
    
    if (!Array.isArray(questions)) {
      console.warn(`Warning: .questions.json in ${templateDir} is not an array, ignoring`);
      return [];
    }
    
    return questions.map(q => ({
      ...q,
      name: normalizeQuestionName(q.name)
    }));
  } catch (error) {
    console.warn(`Warning: Failed to parse .questions.json in ${templateDir}:`, error);
    return [];
  }
}
