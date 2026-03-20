# Testing Guide

## Quick Commands

```bash
task test              # Run all tests
task test:watch        # Run tests in watch mode
task test:coverage     # Run tests with coverage
```

## Test Environment

- **Framework**: Vitest 4 (Vite-native test runner)
- **DOM**: jsdom (full DOM emulation, Vue 3 compatible)
- **Config**: See `vitest.config.ts` for full configuration
- **CI**: Tests run automatically via `.github/workflows/ci.yml`

## Test Files

85 test files, 2050 tests

### Utility Tests (12 files, 263 tests)

| File                          | Tests | Coverage                                                                 |
| ----------------------------- | ----- | ------------------------------------------------------------------------ |
| `arrayUtils.test.ts`          | 49    | findByProp, findById, findByCode, removeById, filterById, buildIdNameMap |
| `characterValidation.test.ts` | 46    | getStepValidation for all wizard steps, getBudgetValidation              |
| `dateUtils.test.ts`           | 5     | formatDate for ISO strings, date-only, undefined, empty, invalid         |
| `debounce.test.ts`            | 6     | delay execution, argument passing, timer reset, cancel functionality     |
| `derivedStats.test.ts`        | 33    | calculateFormulaStat, buildDerivedStatsList, display formatting          |
| `equipmentStats.test.ts`      | 19    | equipment stat calculations and modifiers                                |
| `iconUrl.test.ts`             | 8     | createGetIconUrl factory, icon resolution, undefined/empty handling      |
| `logger.test.ts`              | 29    | context management, child loggers, HTTP request/response logging         |
| `numberUtils.test.ts`         | 7     | number formatting and utility functions                                  |
| `specialUtils.test.ts`        | 39    | special attribute parsing and display                                    |
| `talentGrants.test.ts`        | 8     | talent grant resolution and formatting                                   |
| `talentUtils.test.ts`         | 14    | formatPrerequisite (all types), createPrerequisiteFormatter              |

### Store Tests (8 files, 426 tests)

| File                     | Tests | Coverage                                                                 |
| ------------------------ | ----- | ------------------------------------------------------------------------ |
| `auth.test.ts`           | 33    | login, logout, setAuth, reset, token handling, localStorage              |
| `campaigns.test.ts`      | 44    | fetchCampaigns, selectCampaign, loading states, error handling           |
| `classifiers.test.ts`    | 57    | getDerivedStatValue, cache, initialize, reset, lookups                   |
| `hero.test.ts`           | 72    | initNewHero, loadHero, setName, setLevel, updateResources, tempId        |
| `heroAttributes.test.ts` | 80    | setAttribute, setSkillRank, addExpertise, removeExpertise, clamping      |
| `heroEquipment.test.ts`  | 45    | addEquipment, removeEquipment, stacking, equipped/primary states         |
| `heroTalents.test.ts`    | 54    | addCulture, removeCulture, addTalent, removeTalent, radiant, null guards |
| `wizard.test.ts`         | 41    | startCreate, startEdit, startLevelUp, navigation, step completion        |

### Composable Tests (8 files, 245 tests)

| File                             | Tests | Coverage                                                          |
| -------------------------------- | ----- | ----------------------------------------------------------------- |
| `useDeletionTracker.test.ts`     | 11    | track deletions, batch operations, undo support                   |
| `useEntityIcon.test.ts`          | 14    | useEntityIcon, useChainedEntityIcon, entity/icon resolution       |
| `useErrorHandler.test.ts`        | 45    | HTTP error handling (401-500), auto-retry, XSS sanitization       |
| `useModifierInput.test.ts`       | 58    | normalizeModifierInput, useIncrementDecrement, min/max/budget     |
| `useStepValidation.test.ts`      | 31    | validate, budget, currentStepCode, currentValidation              |
| `useSwipeNavigation.test.ts`     | 23    | touch event handling, swipe detection, threshold/direction        |
| `useTalentPrerequisites.test.ts` | 39    | prerequisite checking, talent lookups, formatPrereq, toggleTalent |
| `useWizardSave.test.ts`          | 24    | save orchestration, dirty detection, error handling               |

### Component Tests (48 files, 957 tests)

#### Character-Creation Shared Components (16 files, 198 tests)

| File                                 | Tests | Coverage                                                         |
| ------------------------------------ | ----- | ---------------------------------------------------------------- |
| `BudgetDisplay.test.ts`              | 9     | Basic rendering, color states (within/over budget), prop display |
| `HeroicPathPanel.test.ts`            | 17    | Path cards, selection, key talent display                        |
| `InfoBanner.test.ts`                 | 7     | Rendering, icon display, custom color support                    |
| `KeyTalentBanner.test.ts`            | 9     | Talent display, view details button                              |
| `OrderSelectionDialog.test.ts`       | 9     | Order selection, dialog behavior                                 |
| `PathSelectionDialog.test.ts`        | 9     | Path selection, dialog behavior                                  |
| `RadiantPathPanel.test.ts`           | 22    | Order selection, surge display, accessibility                    |
| `SelectableCard.test.ts`             | 15    | Selection state, disabled state, accessibility (ARIA)            |
| `SingerAncestryPanel.test.ts`        | 16    | Singer forms, attributes, ability selection                      |
| `SingerFormSelectionDialog.test.ts`  | 9     | Singer form dialog behavior                                      |
| `StartingKitSelectionDialog.test.ts` | 9     | Starting kit dialog behavior                                     |
| `StepNavigation.test.ts`             | 20    | Button states, navigation, loading state                         |
| `StepTabs.test.ts`                   | 17    | Tab rendering, keyboard navigation, accessibility                |
| `TalentDetailDialog.test.ts`         | 13    | Dialog content, prerequisites, action display                    |
| `TalentListItem.test.ts`             | 15    | Item rendering, action buttons, type badges                      |
| `TalentListPanel.test.ts`            | 11    | List display, filtering, empty state                             |

#### Step Components (10 files, 341 tests)

| File                          | Tests | Coverage                                                        |
| ----------------------------- | ----- | --------------------------------------------------------------- |
| `BasicSetupStep.test.ts`      | 33    | Name/level inputs, campaign select, validation, null/NaN guards |
| `AttributesStep.test.ts`      | 38    | Attribute sliders, budget display, increment/decrement          |
| `CultureStep.test.ts`         | 25    | Culture selection, expertises banner, multi-select, edge cases  |
| `SkillsStep.test.ts`          | 29    | Skill groups, rank modification, budget, accessibility          |
| `ExpertisesStep.test.ts`      | 35    | Tab navigation, checkbox selection, read-only, starting kit     |
| `PathsStep.test.ts`           | 42    | Path cards, radiant toggle, singer panel, key talent removal    |
| `StartingKitStep.test.ts`     | 25    | Kit selection, currency, null/NaN guards, equipment filtering   |
| `EquipmentStep.test.ts`       | 21    | Equipment by type, currency, add/remove, edge cases             |
| `PersonalDetailsStep.test.ts` | 37    | Biography, goals, connections, debounced handlers, edge cases   |
| `ReviewStep.test.ts`          | 56    | Validation indicators, all sections display                     |

#### Character Sheet Components (13 files, 265 tests)

| File                         | Tests | Coverage                                                       |
| ---------------------------- | ----- | -------------------------------------------------------------- |
| `CharacterHeader.test.ts`    | 19    | Health display, resource bars, level, ancestry/culture display |
| `DeleteHeroDialog.test.ts`   | 8     | Deletion confirmation, dialog behavior                         |
| `ActionItem.test.ts`         | 57    | Action card rendering, cost display, description truncation    |
| `ActionsTab.test.ts`         | 33    | Actions list, filtering, empty state, loading                  |
| `ConditionsTab.test.ts`      | 19    | Condition toggles, enhanced/exhausted/afflicted params         |
| `EquipmentAddDialog.test.ts` | 19    | Equipment add dialog, search, filtering                        |
| `EquipmentItem.test.ts`      | 52    | Equipment card, quantity, equipped state, primary toggle       |
| `EquipmentTab.test.ts`       | 15    | Equipment grouping, empty state, add equipment                 |
| `ExpertisesTab.test.ts`      | 18    | Expertise list, source badges, grouping by type                |
| `OthersTab.test.ts`          | 41    | Goals, connections, biography, notes, ancestry bonuses         |
| `SkillsTab.test.ts`          | 25    | Skill list, rank display, attribute bonuses                    |
| `StatsTab.test.ts`           | 25    | Derived stats, formulas, stat groups                           |
| `TalentItem.test.ts`         | 14    | Talent card, prerequisites, type badge                         |

#### Shared Components (5 files, 52 tests)

| File                         | Tests | Coverage                       |
| ---------------------------- | ----- | ------------------------------ |
| `HpManagementDialog.test.ts` | 11    | HP heal/damage/override dialog |
| `InfoPopup.test.ts`          | 2     | Info popup rendering           |
| `PrerequisiteList.test.ts`   | 6     | Prerequisite list display      |
| `ResourceBox.test.ts`        | 23    | Resource display, bar states   |
| `SpecialBadges.test.ts`      | 10    | Special attribute badges       |

#### Layout Tests (1 file, 15 tests)

| File                 | Tests | Coverage                                          |
| -------------------- | ----- | ------------------------------------------------- |
| `MainLayout.test.ts` | 15    | Layout rendering, navigation, responsive behavior |

#### Page Components (9 files, 101 tests)

| File                            | Tests | Coverage                                        |
| ------------------------------- | ----- | ----------------------------------------------- |
| `ErrorNotFound.test.ts`         | 7     | 404 display, navigation, accessibility          |
| `ErrorForbidden.test.ts`        | 6     | 403 display, navigation, accessibility          |
| `ErrorServer.test.ts`           | 7     | 500 display, retry button, accessibility        |
| `LoginPage.test.ts`             | 15    | Form submission, redirect validation            |
| `RegisterPage.test.ts`          | 15    | Registration form, validation, error handling   |
| `CampaignsPage.test.ts`         | 9     | Campaign list, navigation, loading/error states |
| `CampaignDetailPage.test.ts`    | 13    | Character cards, health bar, navigation         |
| `CharacterSheetPage.test.ts`    | 14    | Tab navigation, loading/error states            |
| `CharacterCreationPage.test.ts` | 15    | Step display, reset dialog, accessibility       |

### Service Tests (2 files, 36 tests)

| File                   | Tests | Coverage                                      |
| ---------------------- | ----- | --------------------------------------------- |
| `authChannel.test.ts`  | 8     | Cross-tab auth sync via BroadcastChannel      |
| `heroPayloads.test.ts` | 28    | API payload building for hero save operations |

## Contributing Tests

1. Name test files `<filename>.test.ts` next to source file
2. Group tests with `describe` blocks by function, then by scenario
3. Test both success and error cases, including edge cases (null, undefined, empty)
4. Use `vi.useFakeTimers()` for time-dependent tests, restore with `vi.useRealTimers()`
5. Use factory pattern for modules with Vite-specific APIs (see `iconUrl.ts` for example)
6. Use `shallowMount` for component tests with Quasar stubs (see component tests for patterns)
7. Verify with `task test` before committing
