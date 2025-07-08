import type { Server } from 'socket.io';
import type { PlayerState, EnemyState } from '../types';

const AGGRO_RANGE = 200;
const ATTACK_COOLDOWN = 1000;

export function handleEnemyAI(state: { enemies: Record<string, EnemyState>, players: Record<string, PlayerState>, lastEnemyAttack: Record<string, number> }, io: Server) {
  const { enemies, players, lastEnemyAttack } = state;
  Object.values(enemies).forEach(enemy => {
    if (enemy.type === 'aggressiveEnemy' || enemy.isAggressiveEnemy) {
      let nearestId: string | null = null;
      let nearest: PlayerState | null = null;
      let minDist = Infinity;
      Object.entries(players).forEach(([pid, player]) => {
        const dx = (player.x + 16) - (enemy.x + 10);
        const dy = (player.y + 16) - (enemy.y + 10);
        const dist = Math.hypot(dx, dy);
        if (dist < minDist) {
          minDist = dist;
          nearest = player;
          nearestId = pid;
        }
      });
      if (nearest && nearestId && minDist <= AGGRO_RANGE) {
        const attackRange = (enemy.stats.range || 1.5) * 32;
        if (minDist > attackRange) {
          const speed = enemy.stats.movementSpeed || 2;
          const dx = nearest.x - enemy.x;
          const dy = nearest.y - enemy.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 1e-2) {
            const step = Math.min(speed, dist);
            enemy.x += (dx / dist) * step;
            enemy.y += (dy / dist) * step;
            io.emit('entityMoved', { id: enemy.id, x: enemy.x, y: enemy.y, stats: enemy.stats, isPlayer: false, isEnemy: true, type: 'aggressiveEnemy', isAggressiveEnemy: true });
          }
        } else {
          const now = Date.now();
          if (!lastEnemyAttack[enemy.id] || now - lastEnemyAttack[enemy.id] > ATTACK_COOLDOWN) {
            lastEnemyAttack[enemy.id] = now;
            const damage = enemy.stats.baseAttack || 10;
            nearest.stats.currentHealth = Math.max(0, (nearest.stats.currentHealth || nearest.stats.baseHP || 100) - damage);
            io.emit('entityUpdated', { id: nearestId, x: nearest.x, y: nearest.y, stats: nearest.stats, isPlayer: true, isEnemy: false });
          }
        }
      }
    }
  });
} 