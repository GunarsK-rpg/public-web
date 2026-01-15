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

65 test files, 1651 tests

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

### Store Tests (9 files, 389 tests)

| File                     | Tests | Coverage                                                                      |
| ------------------------ | ----- | ----------------------------------------------------------------------------- |
| `auth.test.ts`           | 32    | login, logout, setAuth, reset, token handling, localStorage                   |
| `campaigns.test.ts`      | 23    | fetchCampaigns, selectCampaign, loading states, error handling                |
| `classifiers.test.ts`    | 56    | getDerivedStatValue, cache, initialize, reset, lookups                        |
| `hero.test.ts`           | 47    | initNewHero, loadHero, setName, setLevel, updateResources, tempId             |
| `heroAttributes.test.ts` | 58    | setAttribute, setSkillRank, addExpertise, removeExpertise, clamping           |
| `heroDetails.test.ts`    | 34    | addGoal, removeGoal, addConnection, removeConnection, truncation, edge cases  |
| `heroEquipment.test.ts`  | 42    | addEquipment, removeEquipment, stacking, equipped/primary states, edge cases  |
| `heroTalents.test.ts`    | 49    | addCulture, removeCulture, addTalent, removeTalent, radiant, null hero guards |
| `wizard.test.ts`         | 48    | startCreate, startEdit, startLevelUp, navigation, step completion             |

### Composable Tests (6 files, 228 tests)

| File                             | Tests | Coverage                                                                   |
| -------------------------------- | ----- | -------------------------------------------------------------------------- |
| `useModifierInput.test.ts`       | 58    | normalizeModifierInput, useIncrementDecrement, min/max/budget constraints  |
| `useEntityIcon.test.ts`          | 28    | useEntityIcon, useChainedEntityIcon, entity/icon resolution, reactivity    |
| `useErrorHandler.test.ts`        | 45    | HTTP error handling (401-500), auto-retry, XSS sanitization, notifications |
| `useSwipeNavigation.test.ts`     | 23    | touch event handling, swipe detection, threshold/direction, lifecycle      |
| `useStepValidation.test.ts`      | 31    | validate, budget, currentStepCode, currentValidation, allStepsValidation   |
| `useTalentPrerequisites.test.ts` | 43    | prerequisite checking, talent lookups, formatPrereq, toggleTalent          |

### Component Tests (42 files, 810 tests)

#### Character-Creation Shared Components (12 files, 180 tests)

| File                          | Tests | Coverage                                                         |
| ----------------------------- | ----- | ---------------------------------------------------------------- |
| `BudgetDisplay.test.ts`       | 9     | Basic rendering, color states (within/over budget), prop display |
| `InfoBanner.test.ts`          | 7     | Rendering, icon display, custom color support                    |
| `SelectableCard.test.ts`      | 15    | Selection state, disabled state, accessibility (ARIA)            |
| `HeroicPathPanel.test.ts`     | 17    | Path cards, selection, key talent display                        |
| `KeyTalentBanner.test.ts`     | 9     | Talent display, view details button                              |
| `RadiantPathPanel.test.ts`    | 22    | Order selection, surge display, accessibility                    |
| `SingerAncestryPanel.test.ts` | 16    | Singer forms, attributes, ability selection                      |
| `StepNavigation.test.ts`      | 19    | Button states, navigation, loading state                         |
| `StepTabs.test.ts`            | 27    | Tab rendering, keyboard navigation, accessibility                |
| `TalentDetailDialog.test.ts`  | 13    | Dialog content, prerequisites, action display                    |
| `TalentListItem.test.ts`      | 15    | Item rendering, action buttons, type badges                      |
| `TalentListPanel.test.ts`     | 11    | List display, filtering, empty state                             |

#### Step Components (11 files, 353 tests)

| File                          | Tests | Coverage                                                        |
| ----------------------------- | ----- | --------------------------------------------------------------- |
| `BasicSetupStep.test.ts`      | 30    | Name/level inputs, campaign select, validation, null/NaN guards |
| `AncestryStep.test.ts`        | 20    | Ancestry selection, singer panel, dullform auto-select          |
| `AttributesStep.test.ts`      | 37    | Attribute sliders, budget display, increment/decrement          |
| `CultureStep.test.ts`         | 25    | Culture selection, expertises banner, multi-select, edge cases  |
| `SkillsStep.test.ts`          | 30    | Skill groups, rank modification, budget, accessibility          |
| `ExpertisesStep.test.ts`      | 27    | Tab navigation, checkbox selection, read-only, starting kit     |
| `PathsStep.test.ts`           | 44    | Path cards, radiant toggle, singer panel, key talent removal    |
| `StartingKitStep.test.ts`     | 31    | Kit selection, currency, null/NaN guards, equipment filtering   |
| `EquipmentStep.test.ts`       | 27    | Equipment by type, currency, add/remove, edge cases             |
| `PersonalDetailsStep.test.ts` | 33    | Biography, goals, connections, debounced handlers, edge cases   |
| `ReviewStep.test.ts`          | 49    | Validation indicators, all sections display                     |

#### Character Sheet Components (11 files, 205 tests)

| File                      | Tests | Coverage                                                       |
| ------------------------- | ----- | -------------------------------------------------------------- |
| `CharacterHeader.test.ts` | 29    | Health display, resource bars, level, ancestry/culture display |
| `ActionItem.test.ts`      | 26    | Action card rendering, cost display, description truncation    |
| `ActionsTab.test.ts`      | 15    | Actions list, filtering, empty state, loading                  |
| `EquipmentItem.test.ts`   | 21    | Equipment card, quantity, equipped state, primary toggle       |
| `EquipmentTab.test.ts`    | 15    | Equipment grouping, empty state, add equipment                 |
| `ExpertisesTab.test.ts`   | 16    | Expertise list, source badges, grouping by type                |
| `OthersTab.test.ts`       | 41    | Goals, connections, biography, notes, ancestry bonuses         |
| `SkillsTab.test.ts`       | 19    | Skill list, rank display, attribute bonuses                    |
| `StatsTab.test.ts`        | 20    | Derived stats, formulas, stat groups                           |
| `TalentItem.test.ts`      | 13    | Talent card, prerequisites, type badge                         |
| `TalentsTab.test.ts`      | 31    | Talent list, path/radiant/surge talents, edge cases            |

#### Page Components (8 files, 72 tests)

| File                            | Tests | Coverage                                        |
| ------------------------------- | ----- | ----------------------------------------------- |
| `ErrorNotFound.test.ts`         | 7     | 404 display, navigation, accessibility          |
| `ErrorForbidden.test.ts`        | 6     | 403 display, navigation, accessibility          |
| `ErrorServer.test.ts`           | 7     | 500 display, retry button, accessibility        |
| `LoginPage.test.ts`             | 8     | Form submission, redirect validation            |
| `CampaignsPage.test.ts`         | 9     | Campaign list, navigation, loading/error states |
| `CampaignDetailPage.test.ts`    | 13    | Character cards, health bar, navigation         |
| `CharacterSheetPage.test.ts`    | 11    | Tab navigation, loading/error states            |
| `CharacterCreationPage.test.ts` | 11    | Step display, reset dialog, accessibility       |

## Contributing Tests

1. Name test files `<filename>.test.ts` next to source file
2. Group tests with `describe` blocks by function, then by scenario
3. Test both success and error cases, including edge cases (null, undefined, empty)
4. Use `vi.useFakeTimers()` for time-dependent tests, restore with `vi.useRealTimers()`
5. Use factory pattern for modules with Vite-specific APIs (see `iconUrl.ts` for example)
6. Use `shallowMount` for component tests with Quasar stubs (see component tests for patterns)
7. Verify with `task test` before committing
