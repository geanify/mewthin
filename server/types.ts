export type LootEntry = {
  itemId: string;
  chance: number;
  min?: number;
  max?: number;
};

export type LootTable = LootEntry[];

export type PlayerState = {
  id: string;
  x: number;
  y: number;
  stats: any; // Replace 'any' with PlayerStats if you want to import it here
};

export type EnemyState = {
  id: string;
  x: number;
  y: number;
  stats: any; // Replace 'any' with PlayerStats if you want to import it here
  type?: string;
  isAggressiveEnemy?: boolean;
  isStoneEnemy?: boolean;
  lastSplitPercent?: number;
  targetId?: string;
  noRespawn?: boolean;
  lootTable?: LootTable;
};

export type Entity = {
  id: string;
  x: number;
  y: number;
  prevX?: number;
  prevY?: number;
  isPlayer?: boolean;
  isEnemy?: boolean;
  width?: number;
  height?: number;
  type?: string;
  isAggressiveEnemy?: boolean;
  isStoneEnemy?: boolean;
};

export type LootWorldEntity = {
  id: string;
  x: number;
  y: number;
  type: 'loot';
  itemId: string;
  quantity: number;
};

// You may want to use this union for all world entities:
// export type WorldEntity = PlayerState | EnemyState | LootWorldEntity; 