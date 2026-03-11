import type { ClassifierRef, ClassifierInput } from 'src/types/shared';
import type { Hero, HeroBase } from 'src/types/heroes';
import type { HeroAttribute, HeroAttributeBase } from 'src/types/attributes';
import type { HeroSkill, HeroSkillBase } from 'src/types/skills';
import type { HeroExpertise, HeroExpertiseBase } from 'src/types/expertises';
import type { HeroTalent, HeroTalentBase } from 'src/types/talents';
import type { HeroCulture, HeroCultureBase } from 'src/types/culture';
import type { HeroEquipment, HeroEquipmentBase } from 'src/types/equipments';
import type { HeroGoal, HeroGoalBase, HeroConnection, HeroConnectionBase } from 'src/types/goals';
import type { HeroCompanion, HeroCompanionBase } from 'src/types/companions';
import type { HeroDerivedStatSheet, HeroDerivedStatBase } from 'src/types/derivedStats';

function toClassifierInput(ref: ClassifierRef): ClassifierInput {
  return { code: ref.code };
}

function toOptionalClassifierInput(ref: ClassifierRef | null): ClassifierInput | null {
  return ref ? { code: ref.code } : null;
}

/**
 * Returns `{ id }` for real DB IDs (> 0) so the backend updates the existing row,
 * or an empty object for temp IDs (< 0) so the backend inserts a new row.
 * Used with spread in ID-based upsert payloads (equipment, goals, connections, companions).
 */
function realIdSpread(id: number): { id: number } | Record<string, never> {
  return id > 0 ? { id } : {};
}

export function buildHeroCorePayload(hero: Hero): HeroBase {
  return {
    ...realIdSpread(hero.id),
    name: hero.name,
    level: hero.level,
    radiantIdeal: hero.radiantIdeal,
    currentHealth: hero.currentHealth,
    currentFocus: hero.currentFocus,
    currentInvestiture: hero.currentInvestiture,
    currency: hero.currency,
    campaign: toOptionalClassifierInput(hero.campaign),
    ancestry: toClassifierInput(hero.ancestry),
    appearance: hero.appearance ?? null,
    biography: hero.biography ?? null,
    notes: hero.notes ?? null,
    startingKit: toOptionalClassifierInput(hero.startingKit),
    activeSingerForm: toOptionalClassifierInput(hero.activeSingerForm),
    radiantOrder: toOptionalClassifierInput(hero.radiantOrder),
  };
}

export function buildAttributePayload(heroId: number, attr: HeroAttribute): HeroAttributeBase {
  return {
    heroId,
    attribute: toClassifierInput(attr.attribute),
    value: attr.value,
  };
}

export function buildSkillPayload(heroId: number, skill: HeroSkill): HeroSkillBase {
  return {
    heroId,
    skill: toClassifierInput(skill.skill),
    rank: skill.rank,
    modifier: skill.modifier,
  };
}

export function buildExpertisePayload(heroId: number, exp: HeroExpertise): HeroExpertiseBase {
  if (exp.expertise) {
    return {
      heroId,
      expertise: toClassifierInput(exp.expertise),
      notes: exp.notes ?? null,
      source: exp.source ?? null,
    };
  }
  return {
    heroId,
    expertiseType: toClassifierInput(exp.expertiseType),
    customName: exp.customName ?? null,
    notes: exp.notes ?? null,
    source: exp.source ?? null,
  };
}

export function buildTalentPayload(heroId: number, talent: HeroTalent): HeroTalentBase {
  return {
    heroId,
    talent: toClassifierInput(talent.talent),
    notes: talent.notes ?? null,
  };
}

export function buildCulturePayload(heroId: number, culture: HeroCulture): HeroCultureBase {
  return {
    heroId,
    culture: toClassifierInput(culture.culture),
  };
}

export function buildEquipmentPayload(heroId: number, equip: HeroEquipment): HeroEquipmentBase {
  return {
    ...realIdSpread(equip.id),
    heroId,
    equipment: equip.equipment ? toClassifierInput(equip.equipment) : null,
    amount: equip.amount,
    isEquipped: equip.isEquipped,
    notes: equip.notes ?? null,
    customName: equip.customName ?? null,
    ...(equip.specialOverrides.length > 0 && { specialOverrides: equip.specialOverrides }),
  };
}

export function buildGoalPayload(heroId: number, goal: HeroGoal): HeroGoalBase {
  return {
    ...realIdSpread(goal.id),
    heroId,
    status: toClassifierInput(goal.status),
    name: goal.name,
    description: goal.description ?? null,
    notes: goal.notes ?? null,
    value: goal.value,
  };
}

export function buildConnectionPayload(heroId: number, conn: HeroConnection): HeroConnectionBase {
  return {
    ...realIdSpread(conn.id),
    heroId,
    connectionType: toClassifierInput(conn.connectionType),
    description: conn.description ?? null,
    notes: conn.notes ?? null,
  };
}

export function buildCompanionPayload(heroId: number, comp: HeroCompanion): HeroCompanionBase {
  return {
    ...realIdSpread(comp.id),
    heroId,
    companionType: toClassifierInput(comp.companionType),
    description: comp.description ?? null,
    notes: comp.notes ?? null,
  };
}

export function buildDerivedStatPayload(
  heroId: number,
  stat: HeroDerivedStatSheet
): HeroDerivedStatBase {
  return {
    heroId,
    derivedStat: toClassifierInput(stat.derivedStat),
    modifier: stat.modifier,
  };
}
