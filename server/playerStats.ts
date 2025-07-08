export type PlayerStats = {
  vitality: number;
  strength: number;
  intelligence: number;
  dexterity: number;
  movementSpeed: number;
  attackSpeed: number;
  castingSpeed: number;
  baseHP: number;
  baseMana: number;
  baseAttack: number;
  baseDefense: number;
  baseMagicalDefense: number;
  baseMagicalAttack: number;
  currentHealth: number;
  range: number;
};

export const BASE_STATS: PlayerStats = {
  vitality: 10,
  strength: 10,
  intelligence: 10,
  dexterity: 10,
  movementSpeed: 2,
  attackSpeed: 1,
  castingSpeed: 1,
  baseHP: 100,
  baseMana: 50,
  baseAttack: 10,
  baseDefense: 5,
  baseMagicalDefense: 5,
  baseMagicalAttack: 10,
  currentHealth: 100,
  range: 1.5,
}; 