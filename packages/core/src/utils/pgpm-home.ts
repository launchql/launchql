import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * PGPM Home Directory Management
 * 
 * This class manages an optional state directory for PGPM.
 * 
 * Design Principles:
 * - Attempt creation gracefully
 * - Handle all failures silently (no throws)
 * - System works perfectly without it
 * - Only provides benefits if it exists
 */

const STATE_FILE = 'state.json';

export interface PgpmHomeOptions {
  /**
   * State directory path. Defaults to ~/.pgpm
   */
  stateDir?: string;
}

/**
 * PgpmHome manages optional state storage for PGPM CLI
 * 
 * All methods handle failures gracefully and return null/false on error.
 * The system continues to work normally without the state directory.
 * 
 * @example
 * ```typescript
 * const pgpmHome = new PgpmHome({ stateDir: '~/.pgpm' });
 * 
 * // Initialize (optional - will be attempted automatically when needed)
 * pgpmHome.initialize();
 * 
 * // Read state
 * const state = pgpmHome.readState();
 * 
 * // Write state
 * pgpmHome.writeState({ key: 'value' });
 * 
 * // Update specific keys
 * pgpmHome.updateState({ lastRun: new Date().toISOString() });
 * 
 * // Get specific value
 * const value = pgpmHome.get('key');
 * ```
 */
export class PgpmHome {
  private stateDir: string;
  private stateFilePath: string;

  constructor(options: PgpmHomeOptions = {}) {
    this.stateDir = this.resolveStateDir(options.stateDir);
    this.stateFilePath = path.join(this.stateDir, STATE_FILE);
  }

  /**
   * Resolve the state directory path
   * Defaults to ~/.pgpm if not specified
   */
  private resolveStateDir(stateDir?: string): string {
    if (stateDir) {
      // Expand ~ to home directory
      if (stateDir.startsWith('~/')) {
        try {
          const homeDir = os.homedir();
          return path.join(homeDir, stateDir.slice(2));
        } catch {
          return stateDir;
        }
      }
      return stateDir;
    }

    try {
      const homeDir = os.homedir();
      return path.join(homeDir, '.pgpm');
    } catch {
      return '.pgpm';
    }
  }

  /**
   * Check if the state directory exists
   */
  exists(): boolean {
    try {
      return fs.existsSync(this.stateDir);
    } catch {
      return false;
    }
  }

  /**
   * Attempt to create the state directory if it doesn't exist
   * Returns true if directory exists (either already existed or was created)
   * Returns false if creation failed
   */
  ensure(): boolean {
    try {
      if (fs.existsSync(this.stateDir)) {
        return true;
      }
      
      fs.mkdirSync(this.stateDir, { recursive: true, mode: 0o755 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Read state from state.json file
   * Returns null if file doesn't exist or can't be read
   */
  readState<T = Record<string, any>>(): T | null {
    try {
      if (!fs.existsSync(this.stateFilePath)) return null;
      
      const content = fs.readFileSync(this.stateFilePath, 'utf-8');
      return JSON.parse(content) as T;
    } catch {
      return null;
    }
  }

  /**
   * Write state to state.json file
   * Returns true if successful, false otherwise
   * Will attempt to create state directory if it doesn't exist
   */
  writeState(state: Record<string, any>): boolean {
    try {
      if (!this.ensure()) return false;
      
      const content = JSON.stringify(state, null, 2);
      fs.writeFileSync(this.stateFilePath, content, 'utf-8');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Update specific keys in the state file
   * Returns true if successful, false otherwise
   */
  updateState(updates: Record<string, any>): boolean {
    try {
      const currentState = this.readState() || {};
      const newState = { ...currentState, ...updates };
      return this.writeState(newState);
    } catch {
      return false;
    }
  }

  /**
   * Get a specific value from the state file
   * Returns null if key doesn't exist or state can't be read
   */
  get(key: string): any {
    try {
      const state = this.readState();
      if (!state) return null;
      return state[key] ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Initialize the state directory and state file if they don't exist
   * This is a convenience method that attempts both operations
   * Returns an object indicating what was successful
   */
  initialize(): { dirCreated: boolean; stateInitialized: boolean } {
    const dirCreated = this.ensure();
    
    let stateInitialized = false;
    if (dirCreated) {
      try {
        if (!fs.existsSync(this.stateFilePath)) {
          stateInitialized = this.writeState({
            created: new Date().toISOString(),
            version: '1.0.0'
          });
        } else {
          stateInitialized = true;
        }
      } catch {
        stateInitialized = false;
      }
    }
    
    return { dirCreated, stateInitialized };
  }

  /**
   * Get the resolved state directory path
   */
  getStateDir(): string {
    return this.stateDir;
  }

  /**
   * Get the state file path
   */
  getStateFilePath(): string {
    return this.stateFilePath;
  }
}
