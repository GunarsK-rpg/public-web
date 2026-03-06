import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { HeroSheet } from 'src/types';
import { useHeroStore } from 'src/stores/hero';
import { useHeroAttributesStore } from 'src/stores/heroAttributes';
import { useWizardStore } from 'src/stores/wizard';
import { useStepValidation } from 'src/composables/useStepValidation';
import type { DeletionTracker } from './useDeletionTracker';
import { STEP_CODES } from 'src/types/wizard';
import type { StepCode } from 'src/utils/characterValidation';
import heroService from 'src/services/heroService';
import {
  buildHeroCorePayload,
  buildAttributePayload,
  buildSkillPayload,
  buildExpertisePayload,
  buildTalentPayload,
  buildCulturePayload,
  buildEquipmentPayload,
  buildGoalPayload,
  buildConnectionPayload,
  buildCompanionPayload,
  buildDerivedStatPayload,
} from 'src/services/heroPayloads';
import { logger } from 'src/utils/logger';

export function useWizardSave(deletionTracker: DeletionTracker) {
  const router = useRouter();
  const heroStore = useHeroStore();
  const heroAttributesStore = useHeroAttributesStore();
  const wizardStore = useWizardStore();
  const { currentStepCode, currentValidation } = useStepValidation();

  const saving = ref(false);
  const saveError = ref<string | null>(null);

  async function saveCurrentStep(): Promise<boolean> {
    const stepCode = currentStepCode.value;

    // Validate current step
    const validation = currentValidation.value;
    if (!validation.isValid) {
      saveError.value = validation.errors[0] ?? 'Validation failed';
      return false;
    }

    // Review step: nothing to save
    if (stepCode === STEP_CODES.REVIEW) {
      return true;
    }

    const hero = heroStore.hero;
    if (!hero) {
      saveError.value = 'No hero loaded';
      return false;
    }

    saving.value = true;
    saveError.value = null;

    try {
      await saveStep(stepCode, hero);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      saveError.value = msg;
      logger.error('Failed to save step', { stepCode, error: msg });
      return false;
    } finally {
      saving.value = false;
    }
  }

  async function saveStep(
    stepCode: Exclude<StepCode, typeof STEP_CODES.REVIEW>,
    hero: HeroSheet
  ): Promise<void> {
    switch (stepCode) {
      case STEP_CODES.BASIC_SETUP:
        await saveHeroCore(hero);
        break;
      case STEP_CODES.CULTURE:
        await syncSubResource(hero.id, 'cultures', hero.cultures, buildCulturePayload, 'cultures');
        await syncSubResource(
          hero.id,
          'expertises',
          hero.expertises,
          buildExpertisePayload,
          'expertises'
        );
        break;
      case STEP_CODES.ATTRIBUTES:
        await syncSubResource(
          hero.id,
          'attributes',
          hero.attributes,
          buildAttributePayload,
          'attributes'
        );
        await saveDerivedStatModifiers(hero.id, hero);
        await saveHeroCore(hero);
        break;
      case STEP_CODES.SKILLS:
        // Track previously-saved skills that were zeroed out for deletion
        for (const skill of hero.skills) {
          if (skill.id > 0 && skill.rank === 0 && skill.modifier === 0) {
            deletionTracker.trackDeletion('skills', skill.id);
          }
        }
        await syncSubResource(
          hero.id,
          'skills',
          hero.skills,
          buildSkillPayload,
          'skills',
          (skill) => skill.rank > 0 || skill.modifier !== 0
        );
        break;
      case STEP_CODES.EXPERTISES:
        await syncSubResource(
          hero.id,
          'expertises',
          hero.expertises,
          buildExpertisePayload,
          'expertises'
        );
        break;
      case STEP_CODES.PATHS:
        await saveHeroCore(hero);
        await syncSubResource(hero.id, 'talents', hero.talents, buildTalentPayload, 'talents');
        // Radiant order grants surge skills — save them alongside talents
        await syncSubResource(
          hero.id,
          'skills',
          hero.skills,
          buildSkillPayload,
          'skills',
          (skill) => skill.rank > 0 || skill.modifier !== 0
        );
        break;
      case STEP_CODES.STARTING_KIT:
        await saveHeroCore(hero);
        await syncSubResource(
          hero.id,
          'equipment',
          hero.equipment,
          buildEquipmentPayload,
          'equipment'
        );
        await syncSubResource(
          hero.id,
          'expertises',
          hero.expertises,
          buildExpertisePayload,
          'expertises'
        );
        break;
      case STEP_CODES.EQUIPMENT:
        await saveHeroCore(hero);
        await syncSubResource(
          hero.id,
          'equipment',
          hero.equipment,
          buildEquipmentPayload,
          'equipment'
        );
        break;
      case STEP_CODES.PERSONAL_DETAILS:
        await saveHeroCore(hero);
        await syncSubResource(hero.id, 'goals', hero.goals, buildGoalPayload, 'goals');
        await syncSubResource(
          hero.id,
          'connections',
          hero.connections,
          buildConnectionPayload,
          'connections'
        );
        await syncSubResource(
          hero.id,
          'companions',
          hero.companions,
          buildCompanionPayload,
          'companions'
        );
        break;
      default: {
        const _exhaustive: never = stepCode;
        throw new Error('Unhandled step code: ' + String(_exhaustive));
      }
    }
  }

  async function saveHeroCore(hero: HeroSheet): Promise<void> {
    const isCreate = hero.id === 0;

    // During creation, set current resources to their calculated max values
    if (wizardStore.mode === 'create' && hero.id > 0) {
      hero.currentHealth = heroAttributesStore.getDerivedStatTotal('max_health');
      hero.currentFocus = heroAttributesStore.getDerivedStatTotal('max_focus');
      hero.currentInvestiture = heroAttributesStore.getDerivedStatTotal('max_investiture');
    }

    const payload = buildHeroCorePayload(hero);
    const response = isCreate
      ? await heroService.create(payload)
      : await heroService.update(hero.id, payload);
    heroStore.updateFromResponse(response.data);

    // After first create, update URL so browser refresh resumes via edit route
    if (isCreate && heroStore.hero && heroStore.hero.id > 0) {
      const heroId = heroStore.hero.id;
      void router.replace({
        name: 'character-edit',
        params: { characterId: String(heroId) },
      });
    }
  }

  async function saveDerivedStatModifiers(heroId: number, hero: HeroSheet): Promise<void> {
    if (hero.derivedStats.length === 0) return;

    const results = await Promise.allSettled(
      hero.derivedStats.map((stat) => {
        const payload = buildDerivedStatPayload(heroId, stat);
        return heroService.upsertSubResource(heroId, 'derived-stats', payload);
      })
    );

    const failures = results.filter((r) => r.status === 'rejected');
    if (failures.length > 0) {
      logger.error(`${failures.length} derived stat modifier(s) failed to save`);
      throw new Error('Failed to save some derived-stats');
    }
  }

  async function syncSubResource<T extends { id: number }>(
    heroId: number,
    apiPath: string,
    items: T[],
    buildPayload: (heroId: number, item: T) => unknown,
    deletionKey: string,
    filter?: (item: T) => boolean
  ): Promise<void> {
    const itemsToSync = filter ? items.filter(filter) : items;

    // Upsert first, then delete — avoids racing on overlapping resources
    const upsertResults = await Promise.allSettled(
      itemsToSync.map(async (item) => {
        const payload = buildPayload(heroId, item);
        const response = await heroService.upsertSubResource(heroId, apiPath, payload);
        // Reconcile temp IDs with real DB IDs from the response
        if (item.id <= 0 && response.data?.id > 0) {
          item.id = response.data.id;
        }
      })
    );

    const upsertFailures = upsertResults.filter((r) => r.status === 'rejected');
    if (upsertFailures.length > 0) {
      logger.error(`${upsertFailures.length} upsert(s) failed for ${apiPath}`);
    }

    const deletionIds = deletionTracker.getDeletions(deletionKey);
    // Exclude IDs that were just upserted to prevent stale tracker entries from deleting live data
    const upsertedIds = new Set(itemsToSync.map((item) => item.id));
    const safeDeletionIds = deletionIds.filter((id) => !upsertedIds.has(id));
    const deleteResults = await Promise.allSettled(
      safeDeletionIds.map((id) => heroService.deleteSubResource(heroId, apiPath, id))
    );

    // Only clear successfully deleted IDs; re-track failed ones for retry
    deletionTracker.clearDeletions(deletionKey);
    const failedIds: number[] = [];
    deleteResults.forEach((result, idx) => {
      if (result.status === 'rejected' && safeDeletionIds[idx] !== undefined) {
        failedIds.push(safeDeletionIds[idx]);
      }
    });
    for (const id of failedIds) {
      deletionTracker.trackDeletion(deletionKey, id);
    }
    if (failedIds.length > 0) {
      logger.error(`${failedIds.length} deletion(s) failed for ${apiPath}`);
    }

    if (upsertFailures.length > 0) {
      throw new Error(`Failed to save some ${apiPath}`);
    }
  }

  return {
    saving,
    saveError,
    saveCurrentStep,
  };
}
