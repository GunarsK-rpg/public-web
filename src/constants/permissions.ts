export const Level = {
  NONE: 'none',
  READ: 'read',
  EDIT: 'edit',
  DELETE: 'delete',
} as const;

export type LevelKey = (typeof Level)[keyof typeof Level];

export const LevelValues: Record<LevelKey, number> = {
  [Level.NONE]: 0,
  [Level.READ]: 1,
  [Level.EDIT]: 2,
  [Level.DELETE]: 3,
};

export const Resource = {
  CLASSIFIERS: 'classifiers',
  HEROES: 'heroes',
  CAMPAIGNS: 'campaigns',
} as const;
