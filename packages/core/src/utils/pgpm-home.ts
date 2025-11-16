import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * PGPM Home Directory Management
 * 
 * This module manages the optional .pgpm/ folder in the user's home directory.
 * 
 * Design Principles:
 * - Attempt creation gracefully
 * - Handle all failures silently (no throws)
 * - System works perfectly without it
 * - Only provides benefits if it exists
 */

const PGPM_DIR = '.pgpm';
const STATE_FILE = 'state.json';

/**
 * Get the path to the .pgpm directory in the user's home directory
 */
export function getPgpmHomePath(): string | null {
  try {
    const homeDir = os.homedir();
    if (!homeDir) return null;
    return path.join(homeDir, PGPM_DIR);
  } catch {
    return null;
  }
}

/**
 * Get the path to the state.json file
 */
export function getPgpmStateFilePath(): string | null {
  try {
    const pgpmPath = getPgpmHomePath();
    if (!pgpmPath) return null;
    return path.join(pgpmPath, STATE_FILE);
  } catch {
    return null;
  }
}

/**
 * Check if the .pgpm directory exists
 */
export function pgpmHomeExists(): boolean {
  try {
    const pgpmPath = getPgpmHomePath();
    if (!pgpmPath) return false;
    return fs.existsSync(pgpmPath);
  } catch {
    return false;
  }
}

/**
 * Attempt to create the .pgpm directory if it doesn't exist
 * Returns true if directory exists (either already existed or was created)
 * Returns false if creation failed or path is unavailable
 */
export function ensurePgpmHome(): boolean {
  try {
    const pgpmPath = getPgpmHomePath();
    if (!pgpmPath) return false;
    
    if (fs.existsSync(pgpmPath)) {
      return true;
    }
    
    fs.mkdirSync(pgpmPath, { recursive: true, mode: 0o755 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Read state from state.json file
 * Returns null if file doesn't exist or can't be read
 */
export function readPgpmState(): Record<string, any> | null {
  try {
    const stateFilePath = getPgpmStateFilePath();
    if (!stateFilePath) return null;
    
    if (!fs.existsSync(stateFilePath)) return null;
    
    const content = fs.readFileSync(stateFilePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Write state to state.json file
 * Returns true if successful, false otherwise
 * Will attempt to create .pgpm directory if it doesn't exist
 */
export function writePgpmState(state: Record<string, any>): boolean {
  try {
    if (!ensurePgpmHome()) return false;
    
    const stateFilePath = getPgpmStateFilePath();
    if (!stateFilePath) return false;
    
    const content = JSON.stringify(state, null, 2);
    fs.writeFileSync(stateFilePath, content, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

/**
 * Update specific keys in the state file
 * Returns true if successful, false otherwise
 */
export function updatePgpmState(updates: Record<string, any>): boolean {
  try {
    const currentState = readPgpmState() || {};
    const newState = { ...currentState, ...updates };
    return writePgpmState(newState);
  } catch {
    return false;
  }
}

/**
 * Get a specific value from the state file
 * Returns null if key doesn't exist or state can't be read
 */
export function getPgpmStateValue(key: string): any {
  try {
    const state = readPgpmState();
    if (!state) return null;
    return state[key] ?? null;
  } catch {
    return null;
  }
}

/**
 * Initialize the .pgpm directory and state file if they don't exist
 * This is a convenience function that attempts both operations
 * Returns an object indicating what was successful
 */
export function initializePgpmHome(): { dirCreated: boolean; stateInitialized: boolean } {
  const dirCreated = ensurePgpmHome();
  
  let stateInitialized = false;
  if (dirCreated) {
    const stateFilePath = getPgpmStateFilePath();
    if (stateFilePath) {
      try {
        if (!fs.existsSync(stateFilePath)) {
          stateInitialized = writePgpmState({
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
  }
  
  return { dirCreated, stateInitialized };
}
