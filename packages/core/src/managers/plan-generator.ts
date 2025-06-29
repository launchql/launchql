import fs from 'fs';
import path from 'path';
import { Logger } from '@launchql/logger';
import { SqitchPlanEntry } from '@launchql/types';
import { ConfigManager } from './config-manager';
import { ModuleManager } from './module-manager';
import { ExtensionManager } from './extension-manager';
import { getExtensionsAndModulesChanges } from '../modules';

export class PlanGenerator {
  private logger = new Logger('launchql:plans');

  constructor(
    private configManager: ConfigManager,
    private moduleManager: ModuleManager,
    private extensionManager: ExtensionManager
  ) {}

  generatePlanFromFiles(): string {
    this.configManager.ensureModule();
    const modulePath = this.configManager.getModulePath()!;
    const workspacePath = this.configManager.getWorkspacePath()!;
    const moduleName = this.moduleManager.getModuleName();

    // Get all SQL files
    const sqlFiles = this.moduleManager.getModuleSQL();
    
    // Get dependencies
    const moduleDeps = this.moduleManager.getModuleDependencies();
    const extensionDeps = this.extensionManager.getModuleExtensions();
    
    // Get dependency changes
    const depChanges = this.moduleManager.getModuleDependencyChanges();
    
    // Build plan
    const lines: string[] = [
      '%syntax-version=1.0.0',
      `%project=${moduleName}`,
      ''
    ];

    // Add extension dependencies as comments
    if (extensionDeps.length > 0) {
      lines.push('# Extensions required:');
      extensionDeps.forEach(ext => {
        lines.push(`# - ${ext}`);
      });
      lines.push('');
    }

    // Add module dependencies as comments
    if (moduleDeps.length > 0) {
      lines.push('# Module dependencies:');
      moduleDeps.forEach(mod => {
        lines.push(`# - ${mod}`);
      });
      lines.push('');
    }

    // Add changes
    sqlFiles.forEach((sqlFile, index) => {
      const changeName = this.moduleManager.normalizeChangeName(sqlFile);
      const deps: string[] = [];

      // First change depends on all dependency changes
      if (index === 0 && depChanges.length > 0) {
        deps.push(...depChanges);
      }
      
      // Subsequent changes depend on previous change
      if (index > 0) {
        const prevChange = this.moduleManager.normalizeChangeName(sqlFiles[index - 1]);
        deps.push(prevChange);
      }

      // Build change line
      let line = changeName;
      if (deps.length > 0) {
        line += ` [${deps.join(' ')}]`;
      }
      line += ` ${this.getTimestamp()} ${this.getPlanner()}`;
      
      lines.push(line);
    });

    return lines.join('\n') + '\n';
  }

  writeModulePlan(): void {
    this.configManager.ensureModule();
    const modulePath = this.configManager.getModulePath()!;
    const plan = this.generatePlanFromFiles();
    
    const planPath = path.join(modulePath, 'sqitch.plan');
    fs.writeFileSync(planPath, plan);
    
    this.logger.success(`Written plan to ${planPath}`);
  }

  parsePlanContent(planContent: string): SqitchPlanEntry[] {
    const entries: SqitchPlanEntry[] = [];
    const lines = planContent.split('\n');

    for (const line of lines) {
      // Skip empty lines and comments
      if (!line.trim() || line.startsWith('#') || line.startsWith('%')) {
        continue;
      }

      // Parse change line
      const match = line.match(/^(\S+)(?:\s+\[([^\]]+)\])?(?:\s+(\S+))?(?:\s+(\S+))?(?:\s+#\s*(.*))?$/);
      if (match) {
        const [, name, deps, timestamp, planner, note] = match;
        entries.push({
          name,
          dependencies: deps ? deps.split(/\s+/) : undefined,
          timestamp,
          planner,
          note
        });
      }
    }

    return entries;
  }

  validatePlanConsistency(): { valid: boolean; errors: string[] } {
    this.configManager.ensureModule();
    const errors: string[] = [];
    
    try {
      const plan = this.moduleManager.getModulePlan();
      if (!plan) {
        errors.push('No sqitch.plan file found');
        return { valid: false, errors };
      }

      const entries = this.parsePlanContent(plan);
      const sqlFiles = this.moduleManager.getModuleSQL();
      
      // Check all SQL files have entries
      for (const sqlFile of sqlFiles) {
        const changeName = this.moduleManager.normalizeChangeName(sqlFile);
        const hasEntry = entries.some(e => e.name === changeName);
        if (!hasEntry) {
          errors.push(`Missing plan entry for ${sqlFile}`);
        }
      }

      // Check all entries have SQL files
      for (const entry of entries) {
        const hasSql = sqlFiles.some(f => 
          this.moduleManager.normalizeChangeName(f) === entry.name
        );
        if (!hasSql) {
          errors.push(`Missing SQL file for plan entry ${entry.name}`);
        }
      }

      // Validate dependencies
      const availableChanges = new Set(entries.map(e => e.name));
      const depChanges = new Set(this.moduleManager.getModuleDependencyChanges());

      for (const entry of entries) {
        if (entry.dependencies) {
          for (const dep of entry.dependencies) {
            if (!availableChanges.has(dep) && !depChanges.has(dep)) {
              errors.push(`Unknown dependency ${dep} in change ${entry.name}`);
            }
          }
        }
      }

    } catch (error) {
      errors.push(`Error validating plan: ${error instanceof Error ? error.message : String(error)}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, 'Z');
  }

  private getPlanner(): string {
    // Try to get from git config
    try {
      const gitUser = process.env.GIT_AUTHOR_NAME || process.env.USER || 'Unknown';
      const gitEmail = process.env.GIT_AUTHOR_EMAIL || 'unknown@example.com';
      return `${gitUser} <${gitEmail}>`;
    } catch {
      return 'Unknown <unknown@example.com>';
    }
  }

  addChangeToProject(name: string, dependencies?: string[]): void {
    this.configManager.ensureModule();
    const modulePath = this.configManager.getModulePath()!;
    
    // Normalize change name
    const changeName = this.moduleManager.normalizeChangeName(name);
    
    // Read current plan
    const planPath = path.join(modulePath, 'sqitch.plan');
    let plan = '';
    if (fs.existsSync(planPath)) {
      plan = fs.readFileSync(planPath, 'utf8');
    } else {
      // Create new plan
      plan = `%syntax-version=1.0.0\n%project=${this.moduleManager.getModuleName()}\n\n`;
    }

    // Parse existing entries
    const entries = this.parsePlanContent(plan);
    
    // Check if change already exists
    if (entries.some(e => e.name === changeName)) {
      throw new Error(`Change ${changeName} already exists in plan`);
    }

    // Build new entry
    let entry = changeName;
    if (dependencies && dependencies.length > 0) {
      entry += ` [${dependencies.join(' ')}]`;
    } else if (entries.length > 0) {
      // Depend on last change if no explicit dependencies
      entry += ` [${entries[entries.length - 1].name}]`;
    }
    entry += ` ${this.getTimestamp()} ${this.getPlanner()}`;

    // Append to plan
    plan = plan.trimEnd() + '\n' + entry + '\n';
    
    // Write plan
    fs.writeFileSync(planPath, plan);
    
    // Create SQL file templates
    this.createChangeTemplates(changeName);
    
    this.logger.success(`Added change ${changeName} to plan`);
  }

  private createChangeTemplates(changeName: string): void {
    const modulePath = this.configManager.getModulePath()!;
    const dirs = ['deploy', 'revert', 'verify'];
    
    for (const dir of dirs) {
      const dirPath = path.join(modulePath, dir);
      fs.mkdirSync(dirPath, { recursive: true });
      
      const filePath = path.join(dirPath, `${changeName}.sql`);
      if (!fs.existsSync(filePath)) {
        let content = `-- ${dir}/${changeName}.sql\n`;
        
        switch (dir) {
          case 'deploy':
            content += `-- Deploy ${changeName}\n\nBEGIN;\n\n-- XXX Add DDLs here.\n\nCOMMIT;\n`;
            break;
          case 'revert':
            content += `-- Revert ${changeName}\n\nBEGIN;\n\n-- XXX Add DDLs here.\n\nCOMMIT;\n`;
            break;
          case 'verify':
            content += `-- Verify ${changeName}\n\nBEGIN;\n\n-- XXX Add verifications here.\n\nROLLBACK;\n`;
            break;
        }
        
        fs.writeFileSync(filePath, content);
      }
    }
  }
}