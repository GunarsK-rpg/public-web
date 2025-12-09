/**
 * Attribute type code identifiers
 */
export type AttributeTypeCode = 'physical' | 'cognitive' | 'spiritual';

/**
 * Attribute type classifier
 */
export interface AttributeType {
  id: number;
  code: AttributeTypeCode;
  name: string;
}
