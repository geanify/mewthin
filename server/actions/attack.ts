import type { Server, Socket } from 'socket.io';
import type { PlayerState, EnemyState } from '../types';
import { handleStoneEnemySpawn } from './stone/handleStoneEnemy';
import { ENEMY_SIZE } from '../config';

export function handleAttackAction(payload: any, state: { enemies: Record<string, EnemyState>, players: Record<string, PlayerState> }, socket: Socket, io: Server) {
  const { id, damage } = payload;
  const enemy = state.enemies[id] as EnemyState & { isStoneEnemy?: boolean, lastSplitPercent?: number };
  const player = state.players[socket.id];
  if (!enemy || typeof enemy.stats.currentHealth !== 'number' || !player) return;

  // Range check
  const playerRange = player.stats?.range || 1.5;
  const enemySize = ENEMY_SIZE || 1.5;
  const dx = (player.x) - (enemy.x);
  const dy = (player.y) - (enemy.y);
  const dist = Math.hypot(dx, dy);
  if (dist > playerRange + enemySize * 0.5) return; // Not in range

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
