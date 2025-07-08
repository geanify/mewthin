import type { Server, Socket } from 'socket.io';
import type { PlayerState, EnemyState } from '../types';

export function handleAttackAction(payload: any, state: { enemies: Record<string, EnemyState> }, socket: Socket, io: Server) {
  const { id, damage } = payload;
  const enemy = state.enemies[id];
  if (enemy && typeof enemy.stats.currentHealth === 'number') {
    enemy.stats.currentHealth = Math.max(0, enemy.stats.currentHealth - damage);
    if (enemy.stats.currentHealth <= 0) {
      enemy.x = Math.floor(Math.random() * (800 - 20));
      enemy.stats.currentHealth = enemy.stats.baseHP || 100;
    }
    io.emit('entityUpdated', { id: enemy.id, x: enemy.x, y: enemy.y, stats: enemy.stats, isPlayer: false, isEnemy: true });
  }
} 