import { readFileSync } from 'fs';
import { ConfigFile, ConfigSection, ParseResult, ParseError } from '../types';

/**
 * Parse a sqitch.conf file (INI format)
 * 
 * Example format:
 * [core]
 *   engine = pg
 *   plan_file = sqitch.plan
 *   top_dir = .
 * 
 * [engine "pg"]
 *   target = db:pg:
 *   registry = sqitch
 *   client = psql
 */
export function parseConfigFile(configPath: string): ParseResult<ConfigFile> {
  try {
    const content = readFileSync(configPath, 'utf-8');
    return parseConfigContent(content);
  } catch (error) {
    return {
      errors: [{
        line: 0,
        message: `Failed to read config file: ${error instanceof Error ? error.message : String(error)}`
      }]
    };
  }
}

/**
 * Parse config file content
 */
export function parseConfigContent(content: string): ParseResult<ConfigFile> {
  const lines = content.split('\n');
  const config: ConfigFile = {};
  const errors: ParseError[] = [];
  
  let currentSection: string | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';')) {
      continue;
    }
    
    // Check for section header
    const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      if (!config[currentSection]) {
        config[currentSection] = {};
      }
      continue;
    }
    
    // Parse key-value pairs
    const keyValueMatch = trimmed.match(/^(\s*)([^=]+?)\s*=\s*(.*)$/);
    if (keyValueMatch) {
      if (!currentSection) {
        errors.push({
          line: lineNum,
          message: 'Key-value pair found outside of any section'
        });
        continue;
      }
      
      const [, indent, key, value] = keyValueMatch;
      const trimmedKey = key.trim();
      const trimmedValue = value.trim();
      
      if (!trimmedKey) {
        errors.push({
          line: lineNum,
          message: 'Empty key name'
        });
        continue;
      }
      
      config[currentSection][trimmedKey] = trimmedValue;
      continue;
    }
    
    // If we get here, the line format is invalid
    errors.push({
      line: lineNum,
      message: `Invalid line format: ${trimmed}`
    });
  }
  
  return {
    data: config,
    errors
  };
}

/**
 * Get a specific config value
 */
export function getConfigValue(config: ConfigFile, section: string, key: string): string | undefined {
  return config[section]?.[key];
}

/**
 * Get all values from a section
 */
export function getConfigSection(config: ConfigFile, section: string): ConfigSection | undefined {
  return config[section];
}

/**
 * Check if a config has a specific section
 */
export function hasConfigSection(config: ConfigFile, section: string): boolean {
  return section in config;
}