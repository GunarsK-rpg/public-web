# Testing Guide

## Quick Commands

```bash
task test              # Run all tests
task test:watch        # Run tests in watch mode
task test:coverage     # Run tests with coverage
```

## Test Files

8 test files, 184 tests

| File                          | Tests | Coverage                                                                 |
| ----------------------------- | ----- | ------------------------------------------------------------------------ |
| `arrayUtils.test.ts`          | 49    | findByProp, findById, findByCode, removeById, filterById, buildIdNameMap |
| `characterValidation.test.ts` | 38    | getStepValidation for all wizard steps, getBudgetValidation              |
| `dateUtils.test.ts`           | 5     | formatDate for ISO strings, date-only, undefined, empty, invalid         |
| `debounce.test.ts`            | 6     | delay execution, argument passing, timer reset, cancel functionality     |
| `derivedStats.test.ts`        | 25    | calculateFormulaStat, buildDerivedStatsList, display formatting          |
| `iconUrl.test.ts`             | 9     | getIconUrl for actions/equipment types, undefined/empty handling         |
| `logger.test.ts`              | 29    | context management, child loggers, HTTP request/response logging         |
| `talentUtils.test.ts`         | 23    | formatPrerequisite (all types), createPrerequisiteFormatter              |

## Contributing Tests

1. Name test files `<filename>.test.ts` next to source file
2. Group tests with `describe` blocks by function, then by scenario
3. Test both success and error cases, including edge cases (null, undefined, empty)
4. Verify with `task test` before committing
