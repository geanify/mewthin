import type { Server } from 'socket.io';
import type { PlayerState, EnemyState } from '../types';

const AGGRO_RANGE = 200;
const ATTACK_COOLDOWN = 1000;

function findNearestPlayer(enemy: EnemyState, players: Record<string, PlayerState>) {
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
  return { nearest, nearestId, minDist };
}

function moveAggressiveEnemyTowards(enemy: EnemyState, target: PlayerState, io: Server) {
  const speed = enemy.stats.movementSpeed || 2;
  const dx = target.x - enemy.x;
  const dy = target.y - enemy.y;
  const dist = Math.hypot(dx, dy);
  if (dist > 1e-2) {
    const step = Math.min(speed, dist);
    enemy.x += (dx / dist) * step;
    enemy.y += (dy / dist) * step;
    io.emit('entityMoved', { id: enemy.id, x: enemy.x, y: enemy.y, stats: enemy.stats, isPlayer: false, isEnemy: true, type: 'aggressiveEnemy', isAggressiveEnemy: true });
  }
}

function attackNearestPlayer(enemy: EnemyState, target: PlayerState, targetId: string, lastEnemyAttack: Record<string, number>, io: Server) {
  const now = Date.now();
  if (!lastEnemyAttack[enemy.id] || now - lastEnemyAttack[enemy.id] > ATTACK_COOLDOWN) {
    lastEnemyAttack[enemy.id] = now;
    const damage = enemy.stats.baseAttack || 10;
    target.stats.currentHealth = Math.max(0, (target.stats.currentHealth || target.stats.baseHP || 100) - damage);
    io.emit('entityUpdated', { id: targetId, x: target.x, y: target.y, stats: target.stats, isPlayer: true, isEnemy: false });
  }
}

function handleAggressiveEnemy(enemy: EnemyState, players: Record<string, PlayerState>, lastEnemyAttack: Record<string, number>, io: Server) {
  const { nearest, nearestId, minDist } = findNearestPlayer(enemy, players);
  if (nearest && nearestId && minDist <= AGGRO_RANGE) {
    const attackRange = (enemy.stats.range || 1.5) * 32;
    if (minDist > attackRange) {
      moveAggressiveEnemyTowards(enemy, nearest, io);
    } else {
      attackNearestPlayer(enemy, nearest, nearestId, lastEnemyAttack, io);
    }
  }
}

export function handleEnemyAI(state: { enemies: Record<string, EnemyState>, players: Record<string, PlayerState>, lastEnemyAttack: Record<string, number> }, io: Server) {
  const { enemies, players, lastEnemyAttack } = state;
  Object.values(enemies).forEach(enemy => {
    if (enemy.type === 'aggressiveEnemy' || enemy.isAggressiveEnemy) {
      handleAggressiveEnemy(enemy, players, lastEnemyAttack, io);
    }
  });
} 