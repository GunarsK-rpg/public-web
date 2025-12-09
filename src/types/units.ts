/**
 * Unit code identifiers (cl_units)
 */
export type UnitCode = 'lb' | 'ft' | 'each' | 'pcs';

/**
 * Unit classifier (cl_units)
 */
export interface Unit {
  id: number;
  code: UnitCode;
  name: string;
}
