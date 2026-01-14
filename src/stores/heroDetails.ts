import { defineStore } from 'pinia';
import { useHeroStore } from './hero';
import { useClassifierStore } from './classifiers';
import { findByCode, removeById } from 'src/utils/arrayUtils';

export const useHeroDetailsStore = defineStore('heroDetails', () => {
  const heroStore = useHeroStore();
  const classifierStore = useClassifierStore();

  // ===================
  // GOALS
  // ===================
  function addGoal(name: string, description?: string) {
    if (!heroStore.hero) return;
    const activeStatus = findByCode(classifierStore.goalStatuses, 'active');
    if (!activeStatus) {
      console.warn('Active goal status not found in classifiers');
    }
    heroStore.hero.goals.push({
      id: heroStore.nextTempId(),
      heroId: heroStore.hero.id,
      name,
      ...(description && { description }),
      value: 0,
      statusId: activeStatus?.id ?? 1,
    });
  }

  function removeGoalById(goalId: number): boolean {
    return removeById(heroStore.hero?.goals, goalId);
  }

  // ===================
  // CONNECTIONS
  // ===================
  function addConnection(connTypeId: number, description: string, notes?: string) {
    if (!heroStore.hero) return;
    heroStore.hero.connections.push({
      id: heroStore.nextTempId(),
      heroId: heroStore.hero.id,
      connTypeId,
      description,
      ...(notes ? { notes } : {}),
    });
  }

  function removeConnectionById(connectionId: number): boolean {
    return removeById(heroStore.hero?.connections, connectionId);
  }

  // ===================
  // PERSONAL DETAILS
  // ===================
  // Max lengths match database TEXT columns (practical limit for UI)
  const MAX_TEXT_LENGTH = 10000;

  function setAppearance(appearance: string) {
    if (!heroStore.hero) return;
    heroStore.hero.appearance = appearance.slice(0, MAX_TEXT_LENGTH);
  }

  function setBiography(biography: string) {
    if (!heroStore.hero) return;
    heroStore.hero.biography = biography.slice(0, MAX_TEXT_LENGTH);
  }

  function setNotes(notes: string) {
    if (!heroStore.hero) return;
    heroStore.hero.notes = notes.slice(0, MAX_TEXT_LENGTH);
  }

  return {
    // Goals
    addGoal,
    removeGoalById,

    // Connections
    addConnection,
    removeConnectionById,

    // Personal Details
    setAppearance,
    setBiography,
    setNotes,
  };
});
