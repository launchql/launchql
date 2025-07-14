import fs from 'fs';

/**
 * Get a UTC timestamp string
 */
function getUTCTimestamp(d: Date = new Date()): string {
  return (
    d.getUTCFullYear() +
    '-' + String(d.getUTCMonth() + 1).padStart(2, '0') +
    '-' + String(d.getUTCDate()).padStart(2, '0') +
    'T' + String(d.getUTCHours()).padStart(2, '0') +
    ':' + String(d.getUTCMinutes()).padStart(2, '0') +
    ':' + String(d.getUTCSeconds()).padStart(2, '0') +
    'Z'
  );
}

/**
 * Get a timestamp for the plan file
 */
export function getNow(): string {
  return process.env.NODE_ENV === 'test'
    ? getUTCTimestamp(new Date('2017-08-11T08:11:51Z'))
    : getUTCTimestamp(new Date());
}

export interface PlanEntry {
  change: string;
  dependencies: string[];
  comment?: string;
}

export interface GeneratePlanOptions {
  moduleName: string;
  uri?: string;
  entries: PlanEntry[];
}

/**
 * Generate a plan file content from structured data
 */
export function generatePlan(options: GeneratePlanOptions): string {
  const { moduleName, uri, entries } = options;
  const now = getNow();

  const planfile: string[] = [
    `%syntax-version=1.0.0`,
    `%project=${moduleName}`,
    `%uri=${uri || moduleName}`
  ];

  // Generate the plan entries
  entries.forEach(entry => {
    if (entry.dependencies && entry.dependencies.length > 0) {
      planfile.push(
        `${entry.change} [${entry.dependencies.join(' ')}] ${now} launchql <launchql@5b0c196eeb62>${entry.comment ? ` # ${entry.comment}` : ''}`
      );
    } else {
      planfile.push(
        `${entry.change} ${now} launchql <launchql@5b0c196eeb62>${entry.comment ? ` # ${entry.comment}` : ''}`
      );
    }
  });

  return planfile.join('\n');
}

/**
 * Write a generated plan file to disk
 */
export function writePlan(planPath: string, plan: string): void {
  fs.writeFileSync(planPath, plan);
}