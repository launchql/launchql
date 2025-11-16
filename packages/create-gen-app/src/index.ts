import * as fs from 'fs';

import { cloneRepo } from './clone';
import { extractVariables } from './extract';
import { promptUser } from './prompt';
import { replaceVariables } from './replace';
import { CreateGenOptions } from './types';

export * from './clone';
export * from './extract';
export * from './prompt';
export * from './replace';
export * from './types';

/**
 * Create a new project from a template repository
 * @param options - Options for creating the project
 * @returns Path to the generated project
 */
export async function createGen(options: CreateGenOptions): Promise<string> {
  const { templateUrl, outputDir, argv = {}, noTty = false } = options;
  
  console.log(`Cloning template from ${templateUrl}...`);
  const tempDir = await cloneRepo(templateUrl);
  
  try {
    console.log('Extracting template variables...');
    const extractedVariables = await extractVariables(tempDir);
    
    console.log(`Found ${extractedVariables.fileReplacers.length} file replacers`);
    console.log(`Found ${extractedVariables.contentReplacers.length} content replacers`);
    if (extractedVariables.projectQuestions) {
      console.log(`Found ${extractedVariables.projectQuestions.questions.length} project questions`);
    }
    
    console.log('Prompting for variable values...');
    const answers = await promptUser(extractedVariables, argv, noTty);
    
    console.log(`Generating project in ${outputDir}...`);
    await replaceVariables(tempDir, outputDir, extractedVariables, answers);
    
    console.log('Project created successfully!');
    
    return outputDir;
  } finally {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}
