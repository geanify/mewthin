import type { Server, Socket } from 'socket.io';
import type { PlayerState, EnemyState } from '../types';
import { handleStoneEnemySpawn } from './stone/handleStoneEnemy';
import { ENEMY_SIZE, PLAYER_SIZE } from '../config';

export function handleAttackAction(payload: any, state: { enemies: Record<string, EnemyState>, players: Record<string, PlayerState> }, socket: Socket, io: Server) {
  const { id, damage } = payload;
  const enemy = state.enemies[id] as EnemyState & { isStoneEnemy?: boolean, lastSplitPercent?: number };
  const player = state.players[socket.id];
  if (!enemy || typeof enemy.stats.currentHealth !== 'number' || !player) return;

  // Range check (center to center, bigger hitbox)
  const playerRange = player.stats?.range || 1.5;
  const playerSize = PLAYER_SIZE || 2;
  const enemySize = ENEMY_SIZE || 1.5;
  const playerCenterX = player.x + playerSize / 2;
  const playerCenterY = player.y + playerSize / 2;
  const enemyCenterX = enemy.x + enemySize / 2;
  const enemyCenterY = enemy.y + enemySize / 2;
  const dx = playerCenterX - enemyCenterX;
  const dy = playerCenterY - enemyCenterY;
  const dist = Math.hypot(dx, dy);
  if (dist > playerRange + enemySize) return; // Use full enemy size as hitbox radius

  const prevHealth = enemy.stats.currentHealth;
  enemy.stats.currentHealth = Math.max(0, enemy.stats.currentHealth - damage);

  // Stone Enemy special logic
  if (enemy.isStoneEnemy && typeof enemy.lastSplitPercent === 'number') {
    handleStoneEnemySpawn(enemy, state, io, socket.id);
  }

  if (enemy.stats.currentHealth <= 0) {
    enemy.x = Math.floor(Math.random() * (800 - 20));
    enemy.stats.currentHealth = enemy.stats.baseHP || 100;
  }
  io.emit('entityUpdated', { id: enemy.id, x: enemy.x, y: enemy.y, stats: enemy.stats, isPlayer: false, isEnemy: true });
}
