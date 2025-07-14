import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { parsePlanFile, parsePlanFileSimple } from '../src';
import { ExtendedPlanFile, PlanFile, ParseError } from '../src/types';

export interface LineInsight {
  lineNumber: number;
  content: string;
  type: 'pragma' | 'change' | 'tag' | 'comment' | 'empty' | 'invalid';
  errors?: ParseError[];
  metadata?: {
    pragmaName?: string;
    pragmaValue?: string;
    changeName?: string;
    dependencies?: string[];
    tagName?: string;
    timestamp?: string;
    planner?: string;
    email?: string;
    comment?: string;
  };
}

export interface PlanInsights {
  isValid: boolean;
  errors: ParseError[];
  lineInsights: LineInsight[];
  parsedData?: ExtendedPlanFile;
  simpleData?: PlanFile;
  stats: {
    totalLines: number;
    pragmaCount: number;
    changeCount: number;
    tagCount: number;
    commentCount: number;
    emptyCount: number;
    invalidCount: number;
  };
}

export class TestPlan {
  private fixturePath: string;
  private content: string;
  private lines: string[];
  private insights: PlanInsights;

  constructor(fixturePath: string) {
    // Resolve the fixture path relative to root __fixtures__/sqitch-parser
    const rootDir = dirname(dirname(dirname(__dirname))); // Go up to workspace root
    const basePath = join(rootDir, '__fixtures__', 'sqitch-parser');
    this.fixturePath = join(basePath, fixturePath);
    
    if (!existsSync(this.fixturePath)) {
      throw new Error(`Fixture not found: ${this.fixturePath}`);
    }

    this.content = readFileSync(this.fixturePath, 'utf-8');
    this.lines = this.content.split('\n');
    this.insights = this.analyzePlan();
  }

  private analyzePlan(): PlanInsights {
    const parseResult = parsePlanFile(this.fixturePath);
    
    // Try to parse with simple parser, but catch errors
    let simpleData: PlanFile | undefined;
    try {
      simpleData = parsePlanFileSimple(this.fixturePath);
    } catch (error) {
      // Simple parser throws on invalid files, which is expected
      simpleData = undefined;
    }
    
    const lineInsights: LineInsight[] = [];
    const stats = {
      totalLines: this.lines.length,
      pragmaCount: 0,
      changeCount: 0,
      tagCount: 0,
      commentCount: 0,
      emptyCount: 0,
      invalidCount: 0
    };

    // Analyze each line
    this.lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();
      
      let insight: LineInsight = {
        lineNumber,
        content: line,
        type: 'empty'
      };

      if (trimmedLine === '') {
        insight.type = 'empty';
        stats.emptyCount++;
      } else if (trimmedLine.startsWith('#')) {
        insight.type = 'comment';
        stats.commentCount++;
      } else if (trimmedLine.startsWith('%')) {
        insight.type = 'pragma';
        stats.pragmaCount++;
        
        const match = trimmedLine.match(/^%(\w+)=(.*)$/);
        if (match) {
          insight.metadata = {
            pragmaName: match[1],
            pragmaValue: match[2]
          };
        }
      } else if (trimmedLine.startsWith('@')) {
        insight.type = 'tag';
        stats.tagCount++;
        
        // Handle two tag formats:
        // 1. Standard: @tagname timestamp planner <email> # comment
        // 2. With change: @tagname change_name timestamp planner <email> # comment
        const tagContent = trimmedLine.substring(1); // Remove @
        const parts = tagContent.split(/\s+/);
        
        if (parts.length >= 1) {
          insight.metadata = {
            tagName: '@' + parts[0]
          };
          
          // Check if second part looks like a timestamp or a change name
          if (parts.length > 1 && parts[1].match(/^\d{4}-\d{2}-\d{2}T/)) {
            // Standard format
            insight.metadata.timestamp = parts[1];
            insight.metadata.planner = parts.slice(2, -2).join(' ');
            insight.metadata.email = parts[parts.length - 2];
            const commentMatch = trimmedLine.match(/#\s*(.*)$/);
            if (commentMatch) {
              insight.metadata.comment = commentMatch[1];
            }
          } else if (parts.length > 2) {
            // Format with change name
            insight.metadata.changeName = parts[1];
            insight.metadata.timestamp = parts[2];
            insight.metadata.planner = parts.slice(3, -2).join(' ');
            insight.metadata.email = parts[parts.length - 2];
            const commentMatch = trimmedLine.match(/#\s*(.*)$/);
            if (commentMatch) {
              insight.metadata.comment = commentMatch[1];
            }
          }
        }
      } else {
        // Try to parse as a change
        const changeMatch = trimmedLine.match(/^(\S+)(?:\s+\[([^\]]*)\])?(?:\s+(.*))?$/);
        if (changeMatch) {
          const [, changeName, deps, rest] = changeMatch;
          
          if (changeName && rest) {
            insight.type = 'change';
            stats.changeCount++;
            
            const restParts = rest.split(/\s+/);
            const timestamp = restParts[0];
            const planner = restParts[1];
            const email = restParts[2];
            const comment = restParts.slice(3).join(' ').replace(/^#\s*/, '');
            
            insight.metadata = {
              changeName,
              dependencies: deps ? deps.split(/\s*,\s*/) : [],
              timestamp,
              planner,
              email,
              comment
            };
          } else {
            insight.type = 'invalid';
            stats.invalidCount++;
          }
        } else {
          insight.type = 'invalid';
          stats.invalidCount++;
        }
      }

      // Check for errors on this line
      const lineErrors = parseResult.errors.filter(err => 
        err.line === lineNumber
      );
      
      if (lineErrors.length > 0) {
        insight.errors = lineErrors;
      }

      lineInsights.push(insight);
    });

    return {
      isValid: parseResult.errors.length === 0,
      errors: parseResult.errors,
      lineInsights,
      parsedData: parseResult.data,
      simpleData,
      stats
    };
  }

  // Public API
  getContent(): string {
    return this.content;
  }

  getLines(): string[] {
    return [...this.lines];
  }

  getInsights(): PlanInsights {
    return this.insights;
  }

  getLineInsight(lineNumber: number): LineInsight | undefined {
    return this.insights.lineInsights.find(i => i.lineNumber === lineNumber);
  }

  getErrors(): ParseError[] {
    return this.insights.errors;
  }

  isValid(): boolean {
    return this.insights.isValid;
  }

  getStats() {
    return { ...this.insights.stats };
  }

  // Helper methods for testing
  getChanges(): LineInsight[] {
    return this.insights.lineInsights.filter(i => i.type === 'change');
  }

  getTags(): LineInsight[] {
    return this.insights.lineInsights.filter(i => i.type === 'tag');
  }

  getPragmas(): LineInsight[] {
    return this.insights.lineInsights.filter(i => i.type === 'pragma');
  }

  getInvalidLines(): LineInsight[] {
    return this.insights.lineInsights.filter(i => i.type === 'invalid');
  }

  getLinesWithErrors(): LineInsight[] {
    return this.insights.lineInsights.filter(i => i.errors && i.errors.length > 0);
  }

  // Debug helper
  printInsights(): void {
    console.log(`\nPlan Analysis for: ${this.fixturePath}`);
    console.log(`Valid: ${this.insights.isValid}`);
    console.log(`Stats:`, this.insights.stats);
    
    if (this.insights.errors.length > 0) {
      console.log('\nErrors:');
      this.insights.errors.forEach(err => {
        console.log(`  Line ${err.line}: ${err.message}`);
      });
    }

    console.log('\nLine-by-line insights:');
    this.insights.lineInsights.forEach(insight => {
      if (insight.type !== 'empty') {
        console.log(`  ${insight.lineNumber}: [${insight.type}] ${insight.content.trim()}`);
        if (insight.errors) {
          insight.errors.forEach(err => {
            console.log(`    ERROR: ${err.message}`);
          });
        }
      }
    });
  }
}