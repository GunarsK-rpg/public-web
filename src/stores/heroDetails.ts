import { defineStore } from 'pinia';
import { useHeroStore } from './hero';
import { useClassifierStore } from './classifiers';
import { findByCode, findById, removeById } from 'src/utils/arrayUtils';
import { MAX_NAME_LENGTH, MAX_TEXT_LENGTH } from 'src/constants';

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
      return;
    }
    const trimmedName = name.trim().slice(0, MAX_NAME_LENGTH);
    if (!trimmedName) {
      console.warn('Goal name cannot be empty');
      return;
    }
    const trimmedDesc = description?.trim().slice(0, MAX_TEXT_LENGTH);
    heroStore.hero.goals.push({
      id: heroStore.nextTempId(),
      heroId: heroStore.hero.id,
      name: trimmedName,
      ...(trimmedDesc && { description: trimmedDesc }),
      value: 0,
      status: { id: activeStatus.id, code: activeStatus.code, name: activeStatus.name },
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
    // Validate connection type exists
    const connType = findById(classifierStore.connectionTypes, connTypeId);
    if (!connType) {
      console.warn(`Connection type ${connTypeId} not found in classifiers`);
      return;
    }
    const trimmedDesc = description.trim().slice(0, MAX_TEXT_LENGTH);
    if (!trimmedDesc) {
      console.warn('Connection description cannot be empty');
      return;
    }
    const trimmedNotes = notes?.trim().slice(0, MAX_TEXT_LENGTH);
    heroStore.hero.connections.push({
      id: heroStore.nextTempId(),
      heroId: heroStore.hero.id,
      connectionType: { id: connType.id, code: connType.code, name: connType.name },
      description: trimmedDesc,
      ...(trimmedNotes ? { notes: trimmedNotes } : {}),
    });
  }

  function removeConnectionById(connectionId: number): boolean {
    return removeById(heroStore.hero?.connections, connectionId);
  }

  // ===================
  // PERSONAL DETAILS
  // ===================
  function setAppearance(appearance: string) {
    if (!heroStore.hero) return;
    heroStore.hero.appearance = appearance.trim().slice(0, MAX_TEXT_LENGTH);
  }

  function setBiography(biography: string) {
    if (!heroStore.hero) return;
    heroStore.hero.biography = biography.trim().slice(0, MAX_TEXT_LENGTH);
  }

  function setNotes(notes: string) {
    if (!heroStore.hero) return;
    heroStore.hero.notes = notes.trim().slice(0, MAX_TEXT_LENGTH);
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
