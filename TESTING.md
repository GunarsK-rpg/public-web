# Testing Guide

## Quick Commands

```bash
task test              # Run all tests
task test:watch        # Run tests in watch mode
task test:coverage     # Run tests with coverage
```

## Test Environment

- **Framework**: Vitest (fast, Vite-native test runner)
- **DOM**: happy-dom (lightweight, Vue-compatible)
- **Config**: See `vitest.config.ts` for full configuration
- **CI**: Tests run automatically via `.github/workflows/ci.yml`

## Test Files

8 test files, 183 tests

| File                          | Tests | Coverage                                                                 |
| ----------------------------- | ----- | ------------------------------------------------------------------------ |
| `arrayUtils.test.ts`          | 49    | findByProp, findById, findByCode, removeById, filterById, buildIdNameMap |
| `characterValidation.test.ts` | 38    | getStepValidation for all wizard steps, getBudgetValidation              |
| `dateUtils.test.ts`           | 5     | formatDate for ISO strings, date-only, undefined, empty, invalid         |
| `debounce.test.ts`            | 6     | delay execution, argument passing, timer reset, cancel functionality     |
| `derivedStats.test.ts`        | 25    | calculateFormulaStat, buildDerivedStatsList, display formatting          |
| `iconUrl.test.ts`             | 8     | createGetIconUrl factory, icon resolution, undefined/empty handling      |
| `logger.test.ts`              | 29    | context management, child loggers, HTTP request/response logging         |
| `talentUtils.test.ts`         | 23    | formatPrerequisite (all types), createPrerequisiteFormatter              |

## Contributing Tests

1. Name test files `<filename>.test.ts` next to source file
2. Group tests with `describe` blocks by function, then by scenario
3. Test both success and error cases, including edge cases (null, undefined, empty)
4. Use `vi.useFakeTimers()` for time-dependent tests, restore with `vi.useRealTimers()`
5. Use factory pattern for modules with Vite-specific APIs (see `iconUrl.ts` for example)
6. Verify with `task test` before committing

## Factory Pattern for Vite APIs

Modules using `import.meta.glob` can't be easily mocked. Export a factory function that accepts dependencies, then use it with mock data in tests:

```typescript
// iconUrl.ts - Production uses real Vite imports
export function createGetIconUrl(modules) {
  /* logic */
}
export const getIconUrl = createGetIconUrl(iconModules);

// iconUrl.test.ts - Tests use mock data
const mockModules = { actions: { '...attack.svg': '/path.svg' } };
const getIconUrl = createGetIconUrl(mockModules);
```
