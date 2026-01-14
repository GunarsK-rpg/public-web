# Testing Guide

## Overview

The public-web uses Vitest with happy-dom for unit testing Vue 3 utility functions,
derived stats calculations, character validation, and talent prerequisite formatting.

## Quick Commands

```bash
task test              # Run all tests
task test:watch        # Run tests in watch mode
task test:coverage     # Run tests with coverage
```

## Test Files

4 test files, 134 tests

| File                          | Tests | Coverage                                                                   |
| ----------------------------- | ----- | -------------------------------------------------------------------------- |
| `arrayUtils.test.ts`          | 48    | findByProp, findById, findByCode, removeById, filterById, buildIdNameMap   |
|                               |       | makeNameGetter, buildIdCodeMap, buildLookupMap, groupByKey, groupByFK      |
| `characterValidation.test.ts` | 38    | getStepValidation for all wizard steps, getBudgetValidation                |
| `derivedStats.test.ts`        | 25    | calculateFormulaStat, buildDerivedStatsList, display formatting, modifiers |
| `talentUtils.test.ts`         | 23    | formatPrerequisite (all types), createPrerequisiteFormatter                |

## Test Categories

### Utility Functions (`src/utils/`)

- **Array utilities** - Generic array search, filter, grouping, and map-building functions
- **Character validation** - Wizard step validation and budget calculations
- **Derived stats** - Formula-based and lookup-based stat calculations
- **Talent utilities** - Prerequisite formatting for talent display

## Test Structure

```text
src/
└── utils/
    ├── arrayUtils.ts
    ├── arrayUtils.test.ts          # 48 tests
    ├── characterValidation.ts
    ├── characterValidation.test.ts # 38 tests
    ├── derivedStats.ts
    ├── derivedStats.test.ts        # 25 tests
    ├── talentUtils.ts
    └── talentUtils.test.ts         # 23 tests
```

## Key Testing Patterns

### Test Fixtures

Create reusable fixture factories for consistent test data:

```typescript
const createLevel = (overrides: Partial<Level> = {}): Level => ({
  id: 1,
  code: 'level_1',
  name: 'Level 1',
  level: 1,
  // ... defaults
  ...overrides,
});
```

### Testing Functions with Multiple Inputs

Group tests by function, then by scenario:

```typescript
describe('functionName', () => {
  describe('valid inputs', () => {
    it('handles standard case', () => {});
    it('handles edge case', () => {});
  });

  describe('invalid inputs', () => {
    it('handles null', () => {});
    it('handles undefined', () => {});
  });
});
```

### Mocking Vue ComputedRef

For functions that accept Vue ComputedRef:

```typescript
import type { ComputedRef } from 'vue';

const map = new Map<number, string>([[1, 'Name']]);
const computedMap = { value: map } as ComputedRef<Map<number, string>>;
```

## Configuration

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/utils/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
    },
  },
  resolve: {
    alias: {
      src: fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
```

## CI Integration

Tests run as part of `task ci:all`:

```yaml
ci:all:
  cmds:
    - task: format:check
    - task: lint
    - task: typecheck
    - task: test          # Unit tests
    - task: build
    - task: security:audit
    - task: lint:markdown
```

## Contributing Tests

1. Follow naming: `<filename>.test.ts` next to source file
2. Use descriptive `describe` and `it` blocks with section comments
3. Create fixture factories for complex test data
4. Test both success and error scenarios
5. Test edge cases (null, undefined, empty arrays)
6. Verify with: `task test`
