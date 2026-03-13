import { MAX_NAME_LENGTH, MAX_TEXT_LENGTH } from 'src/constants';

export function trimText(val: string): string {
  return val.trim().slice(0, MAX_TEXT_LENGTH);
}

export function trimName(val: string): string {
  return val.trim().slice(0, MAX_NAME_LENGTH);
}
