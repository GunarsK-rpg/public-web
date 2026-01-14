/**
 * Generic classifier base type
 *
 * This interface provides compile-time type safety only. For runtime validation
 * of API responses, use Zod schemas in the API service layer. Example:
 *
 * ```typescript
 * import { z } from 'zod';
 *
 * const ClassifierSchema = z.object({
 *   id: z.number().int().positive(),
 *   code: z.string().regex(/^[a-z][a-z0-9_-]*$/),
 *   name: z.string().min(1),
 *   description: z.string().optional(),
 * });
 * ```
 *
 * @property id - Unique numeric identifier from the database
 * @property code - Unique machine-readable identifier (lowercase with hyphens/underscores, e.g., 'heavy-weaponry').
 *   Used for lookups and API references. Must match pattern: /^[a-z][a-z0-9_-]*$/
 * @property name - Human-readable display name
 * @property description - Optional detailed description
 */
export interface Classifier {
  id: number;
  code: string;
  name: string;
  description?: string;
}
