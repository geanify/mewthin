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