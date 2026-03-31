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

### Utility Tests

| File                           | Coverage                                                                 |
| ------------------------------ | ------------------------------------------------------------------------ |
| `arrayUtils.test.ts`           | findByProp, findById, findByCode, removeById, filterById, buildIdNameMap |
| `characterValidation.test.ts`  | getStepValidation for all wizard steps, getBudgetValidation              |
| `dateUtils.test.ts`            | formatDate for ISO strings, date-only, undefined, empty, invalid         |
| `debounce.test.ts`             | delay execution, argument passing, timer reset, cancel functionality     |
| `derivedStats.test.ts`         | calculateFormulaStat, buildDerivedStatsList, display formatting          |
| `equipmentActionUtils.test.ts` | equipment action utility functions                                       |
| `equipmentStats.test.ts`       | equipment stat calculations and modifiers                                |
| `iconUrl.test.ts`              | createGetIconUrl factory, icon resolution, undefined/empty handling      |
| `logger.test.ts`               | context management, child loggers, HTTP request/response logging         |
| `numberUtils.test.ts`          | number formatting and utility functions                                  |
| `routeUtils.test.ts`           | route utility functions                                                  |
| `specialUtils.test.ts`         | special attribute parsing and display                                    |
| `stringUtils.test.ts`          | string utility functions                                                 |
| `talentGrants.test.ts`         | talent grant resolution and formatting                                   |
| `talentUtils.test.ts`          | formatPrerequisite (all types), createPrerequisiteFormatter              |

### Store Tests

| File                     | Coverage                                                                 |
| ------------------------ | ------------------------------------------------------------------------ |
| `auth.test.ts`           | login, logout, setAuth, reset, token handling, localStorage              |
| `campaigns.test.ts`      | fetchCampaigns, selectCampaign, loading states, error handling           |
| `classifiers.test.ts`    | getDerivedStatValue, cache, initialize, reset, lookups                   |
| `combat.test.ts`         | combat store operations                                                  |
| `hero.test.ts`           | initNewHero, loadHero, setName, setLevel, updateResources, tempId        |
| `heroAttributes.test.ts` | setAttribute, setSkillRank, addExpertise, removeExpertise, clamping      |
| `heroEquipment.test.ts`  | addEquipment, removeEquipment, stacking, equipped/primary states         |
| `heroTalents.test.ts`    | addCulture, removeCulture, addTalent, removeTalent, radiant, null guards |
| `wizard.test.ts`         | startCreate, startEdit, startLevelUp, navigation, step completion        |

### Composable Tests

| File                             | Coverage                                                          |
| -------------------------------- | ----------------------------------------------------------------- |
| `useDeletionTracker.test.ts`     | track deletions, batch operations, undo support                   |
| `useEntityIcon.test.ts`          | useEntityIcon, useChainedEntityIcon, entity/icon resolution       |
| `useErrorHandler.test.ts`        | HTTP error handling (401-500), auto-retry, XSS sanitization       |
| `useModifierInput.test.ts`       | normalizeModifierInput, useIncrementDecrement, min/max/budget     |
| `useNpcEditState.test.ts`        | canEdit, isFormValid, startEdit, cloneAsNew, cancelEdit, payload  |
| `useNpcItemDialog.test.ts`       | add/edit/remove features, actions, opportunities, null guards     |
| `useNpcStatDialog.test.ts`       | add/edit/remove skills and derived stats, classifier lookup       |
| `useStepValidation.test.ts`      | validate, budget, currentStepCode, currentValidation              |
| `useSwipeNavigation.test.ts`     | touch event handling, swipe detection, threshold/direction        |
| `useTalentPrerequisites.test.ts` | prerequisite checking, talent lookups, formatPrereq, toggleTalent |
| `useWizardSave.test.ts`          | save orchestration, dirty detection, error handling               |

### Component Tests

#### Character-Creation Shared Components

| File                                 | Coverage                                                         |
| ------------------------------------ | ---------------------------------------------------------------- |
| `BudgetDisplay.test.ts`              | Basic rendering, color states (within/over budget), prop display |
| `HeroicPathPanel.test.ts`            | Path cards, selection, key talent display                        |
| `InfoBanner.test.ts`                 | Rendering, icon display, custom color support                    |
| `KeyTalentBanner.test.ts`            | Talent display, view details button                              |
| `OrderSelectionDialog.test.ts`       | Order selection, dialog behavior                                 |
| `PathSelectionDialog.test.ts`        | Path selection, dialog behavior                                  |
| `RadiantPathPanel.test.ts`           | Order selection, surge display, accessibility                    |
| `SelectableCard.test.ts`             | Selection state, disabled state, accessibility (ARIA)            |
| `SingerAncestryPanel.test.ts`        | Singer forms, attributes, ability selection                      |
| `SingerFormSelectionDialog.test.ts`  | Singer form dialog behavior                                      |
| `StartingKitSelectionDialog.test.ts` | Starting kit dialog behavior                                     |
| `StepNavigation.test.ts`             | Button states, navigation, loading state                         |
| `StepTabs.test.ts`                   | Tab rendering, keyboard navigation, accessibility                |
| `TalentDetailDialog.test.ts`         | Dialog content, prerequisites, action display                    |
| `TalentListItem.test.ts`             | Item rendering, action buttons, type badges                      |
| `TalentListPanel.test.ts`            | List display, filtering, empty state                             |

#### Step Components

| File                          | Coverage                                                        |
| ----------------------------- | --------------------------------------------------------------- |
| `BasicSetupStep.test.ts`      | Name/level inputs, campaign select, validation, null/NaN guards |
| `AttributesStep.test.ts`      | Attribute sliders, budget display, increment/decrement          |
| `CultureStep.test.ts`         | Culture selection, expertises banner, multi-select, edge cases  |
| `SkillsStep.test.ts`          | Skill groups, rank modification, budget, accessibility          |
| `ExpertisesStep.test.ts`      | Tab navigation, checkbox selection, read-only, starting kit     |
| `PathsStep.test.ts`           | Path cards, radiant toggle, singer panel, key talent removal    |
| `StartingKitStep.test.ts`     | Kit selection, currency, null/NaN guards, equipment filtering   |
| `EquipmentStep.test.ts`       | Equipment by type, currency, add/remove, edge cases             |
| `PersonalDetailsStep.test.ts` | Biography, goals, connections, debounced handlers, edge cases   |
| `ReviewStep.test.ts`          | Validation indicators, all sections display                     |

#### Character Sheet Components

| File                         | Coverage                                                       |
| ---------------------------- | -------------------------------------------------------------- |
| `CharacterHeader.test.ts`    | Health display, resource bars, level, ancestry/culture display |
| `DeleteHeroDialog.test.ts`   | Deletion confirmation, dialog behavior                         |
| `ActionItem.test.ts`         | Action card rendering, cost display, description truncation    |
| `ActionsTab.test.ts`         | Actions list, filtering, empty state, loading                  |
| `ConditionsTab.test.ts`      | Condition toggles, enhanced/exhausted/afflicted params         |
| `EquipmentAddDialog.test.ts` | Equipment add dialog, search, filtering                        |
| `EquipmentItem.test.ts`      | Equipment card, quantity, equipped state, primary toggle       |
| `EquipmentTab.test.ts`       | Equipment grouping, empty state, add equipment                 |
| `ExpertisesTab.test.ts`      | Expertise list, source badges, grouping by type                |
| `ModificationLabel.test.ts`  | Modification label rendering                                   |
| `OthersTab.test.ts`          | Goals, connections, biography, notes, ancestry bonuses         |
| `SkillsTab.test.ts`          | Skill list, rank display, attribute bonuses                    |
| `StatsTab.test.ts`           | Derived stats, formulas, stat groups                           |
| `TalentItem.test.ts`         | Talent card, prerequisites, type badge                         |
| `TalentsTab.test.ts`         | Talent list, path/radiant/surge talents, edge cases            |

#### Shared Components

| File                         | Coverage                       |
| ---------------------------- | ------------------------------ |
| `HpManagementDialog.test.ts` | HP heal/damage/override dialog |
| `InfoPopup.test.ts`          | Info popup rendering           |
| `PrerequisiteList.test.ts`   | Prerequisite list display      |
| `ResourceBox.test.ts`        | Resource display, bar states   |
| `SpecialBadges.test.ts`      | Special attribute badges       |

#### Layout Tests

| File                 | Coverage                                          |
| -------------------- | ------------------------------------------------- |
| `MainLayout.test.ts` | Layout rendering, navigation, responsive behavior |

#### Page Components

| File                            | Coverage                                               |
| ------------------------------- | ------------------------------------------------------ |
| `AccountPage.test.ts`           | Profile, verification, linked accounts, password forms |
| `CampaignDetailPage.test.ts`    | Character cards, health bar, navigation                |
| `CampaignFormPage.test.ts`      | Create/edit modes, form validation, submit             |
| `CampaignsPage.test.ts`         | Campaign list, navigation, loading/error states        |
| `CharacterCreationPage.test.ts` | Step display, reset dialog, accessibility              |
| `CharacterSheetPage.test.ts`    | Tab navigation, loading/error states                   |
| `CombatDetailPage.test.ts`      | Combat load, NPC sections, round counter, error/404    |
| `ErrorForbidden.test.ts`        | 403 display, navigation, accessibility                 |
| `ErrorNotFound.test.ts`         | 404 display, navigation, accessibility                 |
| `ErrorServer.test.ts`           | 500 display, retry button, accessibility               |
| `ForgotPasswordPage.test.ts`    | Form rendering, submit success/error, rate limit       |
| `GoogleCallbackPage.test.ts`    | Loading, success redirect, error states, remember me   |
| `JoinCampaignPage.test.ts`      | Campaign details, unassigned heroes, not found, error  |
| `LoginPage.test.ts`             | Form submission, redirect validation                   |
| `MyCharactersPage.test.ts`      | Hero cards, empty state, loading, error                |
| `NpcDetailPage.test.ts`         | Load NPC, error/invalid IDs, create mode               |
| `NpcInstancePage.test.ts`       | Load instance, error/invalid IDs, stat block render    |
| `PrivacyPolicyPage.test.ts`     | Section headings, GDPR rights, contact, disclaimer     |
| `RegisterPage.test.ts`          | Registration form, validation, error handling          |
| `ResetPasswordPage.test.ts`     | Form render, missing token, submit success/error       |
| `VerifyEmailPage.test.ts`       | Loading, success, error, missing token, CTA routing    |

### Service Tests

| File                   | Coverage                                      |
| ---------------------- | --------------------------------------------- |
| `authChannel.test.ts`  | Cross-tab auth sync via BroadcastChannel      |
| `heroPayloads.test.ts` | API payload building for hero save operations |

## Contributing Tests

1. Name test files `<filename>.test.ts` next to source file
2. Group tests with `describe` blocks by function, then by scenario
3. Test both success and error cases, including edge cases (null, undefined, empty)
4. Use `vi.useFakeTimers()` for time-dependent tests, restore with `vi.useRealTimers()`
5. Use factory pattern for modules with Vite-specific APIs (see `iconUrl.ts` for example)
6. Use `shallowMount` for component tests with Quasar stubs (see component tests for patterns)
7. Verify with `task test` before committing
