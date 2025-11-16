import { Inquirerer, Question } from 'inquirerer';

import { ExtractedVariables } from './types';

/**
 * Generate questions from extracted variables
 * @param extractedVariables - Variables extracted from the template
 * @returns Array of questions to prompt the user
 */
export function generateQuestions(extractedVariables: ExtractedVariables): Question[] {
  const questions: Question[] = [];
  const askedVariables = new Set<string>();
  
  if (extractedVariables.projectQuestions) {
    for (const question of extractedVariables.projectQuestions.questions) {
      questions.push(question);
      askedVariables.add(question.name);
    }
  }
  
  for (const replacer of extractedVariables.fileReplacers) {
    if (!askedVariables.has(replacer.variable)) {
      questions.push({
        name: replacer.variable,
        type: 'text',
        message: `Enter value for ${replacer.variable}:`,
        required: true
      });
      askedVariables.add(replacer.variable);
    }
  }
  
  for (const replacer of extractedVariables.contentReplacers) {
    if (!askedVariables.has(replacer.variable)) {
      questions.push({
        name: replacer.variable,
        type: 'text',
        message: `Enter value for ${replacer.variable}:`,
        required: true
      });
      askedVariables.add(replacer.variable);
    }
  }
  
  return questions;
}

/**
 * Prompt the user for variable values
 * @param extractedVariables - Variables extracted from the template
 * @param argv - Command-line arguments to pre-populate answers
 * @param noTty - Whether to disable TTY mode
 * @returns Answers from the user
 */
export async function promptUser(
  extractedVariables: ExtractedVariables,
  argv: Record<string, any> = {},
  noTty: boolean = false
): Promise<Record<string, any>> {
  const questions = generateQuestions(extractedVariables);
  
  if (questions.length === 0) {
    return argv;
  }
  
  const prompter = new Inquirerer({
    noTty
  });
  
  const answers = await prompter.prompt(argv, questions);
  
  return answers;
}
