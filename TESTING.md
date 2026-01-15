# Testing Guide

## Quick Commands

```bash
task test              # Run all tests
task test:watch        # Run tests in watch mode
task test:coverage     # Run tests with coverage
```

## Test Environment

- **Framework**: Vitest (fast, Vite-native test runner)
- **DOM**: jsdom (full DOM emulation, Vue 3 compatible)
- **Config**: See `vitest.config.ts` for full configuration
- **CI**: Tests run automatically via `.github/workflows/ci.yml`

## Test Files

23 test files, 734 tests

### Utility Tests (8 files, 183 tests)

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

### Store Tests (9 files, 323 tests)

| File                     | Tests | Coverage                                                                |
| ------------------------ | ----- | ----------------------------------------------------------------------- |
| `auth.test.ts`           | 32    | login, logout, setAuth, reset, token handling, localStorage             |
| `campaigns.test.ts`      | 23    | fetchCampaigns, selectCampaign, loading states, error handling          |
| `classifiers.test.ts`    | 27    | getDerivedStatValue, cache, initialize, reset, lookups                  |
| `hero.test.ts`           | 47    | initNewHero, loadHero, setName, setLevel, updateResources, tempId       |
| `heroAttributes.test.ts` | 58    | setAttribute, setSkillRank, addExpertise, removeExpertise, clamping     |
| `heroDetails.test.ts`    | 23    | addGoal, removeGoal, addConnection, removeConnection, truncation        |
| `heroEquipment.test.ts`  | 30    | addEquipment, removeEquipment, stacking, equipped/primary states        |
| `heroTalents.test.ts`    | 35    | addCulture, removeCulture, addTalent, removeTalent, addKeyTalentForPath |
| `wizard.test.ts`         | 48    | startCreate, startEdit, startLevelUp, navigation, step completion       |

### Composable Tests (6 files, 228 tests)

| File                             | Tests | Coverage                                                                   |
| -------------------------------- | ----- | -------------------------------------------------------------------------- |
| `useModifierInput.test.ts`       | 58    | normalizeModifierInput, useIncrementDecrement, min/max/budget constraints  |
| `useEntityIcon.test.ts`          | 28    | useEntityIcon, useChainedEntityIcon, entity/icon resolution, reactivity    |
| `useErrorHandler.test.ts`        | 45    | HTTP error handling (401-500), auto-retry, XSS sanitization, notifications |
| `useSwipeNavigation.test.ts`     | 23    | touch event handling, swipe detection, threshold/direction, lifecycle      |
| `useStepValidation.test.ts`      | 31    | validate, budget, currentStepCode, currentValidation, allStepsValidation   |
| `useTalentPrerequisites.test.ts` | 43    | prerequisite checking, talent lookups, formatPrereq, toggleTalent          |

## Contributing Tests

1. Name test files `<filename>.test.ts` next to source file
2. Group tests with `describe` blocks by function, then by scenario
3. Test both success and error cases, including edge cases (null, undefined, empty)
4. Use `vi.useFakeTimers()` for time-dependent tests, restore with `vi.useRealTimers()`
5. Use factory pattern for modules with Vite-specific APIs (see `iconUrl.ts` for example)
6. Verify with `task test` before committing
