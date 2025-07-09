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
  movementSpeed: 1,
  attackSpeed: 3,
  castingSpeed: 1,
  baseHP: 100,
  baseMana: 50,
  baseAttack: 10,
  baseDefense: 5,
  baseMagicalDefense: 5,
  baseMagicalAttack: 10,
  currentHealth: 100,
  range: 4.5,
};

export const STONE_ENEMY_STATS: PlayerStats = {
  vitality: 50,
  strength: 20,
  intelligence: 5,
  dexterity: 5,
  movementSpeed: 1,
  attackSpeed: 1,
  castingSpeed: 1,
  baseHP: 2000,
  baseMana: 0,
  baseAttack: 20,
  baseDefense: 30,
  baseMagicalDefense: 20,
  baseMagicalAttack: 0,
  currentHealth: 2000,
  range: 1.5,
}; 