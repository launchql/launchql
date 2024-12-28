export abstract class BaseModel<T> {
  private _dirtyFields: Set<keyof T> = new Set(); // Tracks dirty fields

  constructor(protected data: Partial<T>) {
    // Base class can initialize shared properties if needed
  }

  // Mark a field as dirty
  protected markDirty<K extends keyof T>(field: K): void {
    this._dirtyFields.add(field);
  }

  // Get all dirty fields
  public getDirtyFields(): (keyof T)[] {
    return Array.from(this._dirtyFields);
  }

  // Save method to persist changes and clear dirty fields
  public save(): void {
    if (this._dirtyFields.size > 0) {
      console.log(`Saving changes to the following fields: ${this.getDirtyFields().join(', ')}`);
      // Perform database save operation (logic not shown here)
      this._dirtyFields.clear(); // Clear dirty fields after saving
    } else {
      console.log('No changes to save.');
    }
  }
}
