/**
 * Generic classifier base type
 *
 * @property code - Unique machine-readable identifier (lowercase snake_case, e.g., 'heavy_weaponry').
 *   Used for lookups and API references. Must match pattern: /^[a-z][a-z0-9_]*$/
 */
export interface Classifier {
  id: number;
  code: string;
  name: string;
  description?: string;
}
