/**
 * Connection type code identifiers
 */
export type ConnectionTypeCode = 'ally' | 'contact' | 'rival' | 'enemy' | 'patron' | 'follower';

/**
 * Connection type classifier
 */
export interface ConnectionType {
  id: number;
  code: ConnectionTypeCode;
  name: string;
  description?: string;
}
